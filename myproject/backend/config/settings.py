# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# ALLOWED_HOSTS = ['*']
ALLOWED_HOSTS = [
    'room-reservation-system-app-dev-production.up.railway.app',
    'localhost',
    '127.0.0.1',
]

CORS_ALLOWED_ORIGINS = [
    "https://room-reservation-system-app-dev.vercel.app",
]


@@ -63,14 +58,14 @@


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'

]

ROOT_URLCONF = 'config.urls'
@@ -119,6 +114,9 @@
    ]
}



# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators
@@ -157,4 +155,4 @@
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.User'
