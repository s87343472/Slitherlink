#!/bin/bash

# SSL证书设置脚本 - Slitherlink生产环境
# 此脚本使用Let's Encrypt获取免费SSL证书

set -e

DOMAIN="slitherlinks.com"
EMAIL="admin@slitherlinks.com"  # 请更改为实际邮箱
WEBROOT="/var/www/html"

echo "=== Slitherlink SSL证书设置 ==="
echo "域名: $DOMAIN"
echo "邮箱: $EMAIL"
echo ""

# 检查是否以root权限运行
if [ "$EUID" -ne 0 ]; then
    echo "错误: 此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

# 检查域名是否解析到当前服务器
echo "检查域名DNS解析..."
CURRENT_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$CURRENT_IP" != "$DOMAIN_IP" ]; then
    echo "警告: 域名 $DOMAIN 未解析到当前服务器IP ($CURRENT_IP)"
    echo "当前域名解析IP: $DOMAIN_IP"
    echo "请确保DNS记录正确配置后再运行此脚本"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 安装Certbot
echo "安装Certbot..."
if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    yum install -y epel-release
    yum install -y certbot python3-certbot-nginx
else
    echo "错误: 不支持的操作系统"
    exit 1
fi

# 停止Nginx（如果正在运行）
echo "停止Nginx服务..."
systemctl stop nginx 2>/dev/null || true

# 创建webroot目录
mkdir -p $WEBROOT

# 获取SSL证书
echo "获取SSL证书..."
certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN

# 检查证书是否成功获取
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "错误: SSL证书获取失败"
    exit 1
fi

# 创建证书链接（便于Nginx配置）
echo "创建证书软链接..."
mkdir -p /etc/ssl/certs /etc/ssl/private

ln -sf /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/ssl/certs/$DOMAIN.crt
ln -sf /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/ssl/private/$DOMAIN.key

# 设置证书文件权限
chmod 644 /etc/ssl/certs/$DOMAIN.crt
chmod 600 /etc/ssl/private/$DOMAIN.key

# 配置证书自动续期
echo "配置证书自动续期..."
cat > /etc/cron.d/certbot-renewal << EOF
# 每天凌晨2点检查证书续期
0 2 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# 测试证书续期
echo "测试证书续期..."
certbot renew --dry-run

echo ""
echo "=== SSL证书设置完成 ==="
echo "证书位置:"
echo "  公钥: /etc/ssl/certs/$DOMAIN.crt"
echo "  私钥: /etc/ssl/private/$DOMAIN.key"
echo ""
echo "证书有效期: 90天"
echo "自动续期: 已配置 (每天2点检查)"
echo ""
echo "现在可以启动Nginx服务:"
echo "  sudo systemctl start nginx"
echo "  sudo systemctl enable nginx"
echo ""