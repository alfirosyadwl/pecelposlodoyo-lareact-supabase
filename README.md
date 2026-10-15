konfigurasi supabase di file .env dengan method pooler
DB_CONNECTION=pgsql
DB_HOST=aws-0-[REGION].pooler.supabase.com  # Sesuai host Supabase Anda
DB_PORT=6543 # Biasanya 6543 untuk transaction pooler Supabase
DB_DATABASE=postgres
DB_USERNAME=postgres.[PROJECT_REF]
DB_PASSWORD=[PASSWORD_SUPABASE_ANDA]
