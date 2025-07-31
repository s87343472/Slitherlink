#!/bin/bash

set -e

echo "🗄️  Setting up PostgreSQL database for Slitherlink..."

# 检查是否已安装PostgreSQL
if command -v psql >/dev/null 2>&1; then
    echo "✅ PostgreSQL is already installed"
else
    echo "📥 Installing PostgreSQL..."
    
    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew >/dev/null 2>&1; then
            brew install postgresql
            brew services start postgresql
        else
            echo "❌ Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    # Ubuntu/Debian
    elif [[ -f /etc/debian_version ]]; then
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    # CentOS/RHEL
    elif [[ -f /etc/redhat-release ]]; then
        sudo yum install -y postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        echo "❌ Unsupported OS. Please install PostgreSQL manually."
        exit 1
    fi
    
    echo "✅ PostgreSQL installed successfully"
fi

# 数据库配置
DB_NAME="slitherlink"
DB_USER="slitherlink_user"
DB_PASSWORD="slitherlink_password"

echo "🔧 Configuring database..."

# 创建数据库用户和数据库
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - 使用当前用户
    createdb "$DB_NAME" 2>/dev/null || echo "Database $DB_NAME already exists"
    
    psql -d postgres -c "
        DO \$\$ 
        BEGIN 
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DB_USER') THEN 
                CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD'; 
            END IF; 
        END 
        \$\$;
    " 2>/dev/null || true
    
    psql -d postgres -c "ALTER USER $DB_USER CREATEDB;" 2>/dev/null || true
    psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
else
    # Linux - 使用postgres用户
    sudo -u postgres createdb "$DB_NAME" 2>/dev/null || echo "Database $DB_NAME already exists"
    
    sudo -u postgres psql -c "
        DO \$\$ 
        BEGIN 
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DB_USER') THEN 
                CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD'; 
            END IF; 
        END 
        \$\$;
    " 2>/dev/null || true
    
    sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
fi

echo "✅ Database configuration completed"

# 创建 .env 文件
ENV_FILE="../.env"
if [[ ! -f "$ENV_FILE" ]]; then
    echo "📝 Creating .env file..."
    cp "../.env.example" "$ENV_FILE"
    
    # 更新数据库配置
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/DB_NAME=slitherlink/DB_NAME=$DB_NAME/" "$ENV_FILE"
        sed -i '' "s/DB_USER=postgres/DB_USER=$USER/" "$ENV_FILE"
        sed -i '' "s/DB_PASSWORD=password/DB_PASSWORD=/" "$ENV_FILE"
    else
        sed -i "s/DB_NAME=slitherlink/DB_NAME=$DB_NAME/" "$ENV_FILE"
        sed -i "s/DB_USER=postgres/DB_USER=$DB_USER/" "$ENV_FILE"
        sed -i "s/DB_PASSWORD=password/DB_PASSWORD=$DB_PASSWORD/" "$ENV_FILE"
    fi
    
    echo "✅ .env file created with database configuration"
else
    echo "⚠️  .env file already exists, please update database configuration manually if needed"
fi

# 测试数据库连接
echo "🔍 Testing database connection..."
if psql -h localhost -d "$DB_NAME" -U "$DB_USER" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection test successful"
else
    echo "❌ Database connection test failed. Please check your configuration."
    exit 1
fi

echo ""
echo "🎉 Database setup completed!"
echo ""
echo "Database Details:"
echo "  - Host: localhost"
echo "  - Port: 5432"
echo "  - Database: $DB_NAME"
echo "  - User: $DB_USER"
echo ""
echo "Next steps:"
echo "  1. cd to the backend directory"
echo "  2. npm install"
echo "  3. npm run db:migrate"
echo "  4. npm run dev"