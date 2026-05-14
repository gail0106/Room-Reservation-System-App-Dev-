from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, ProfileView, CustomLoginView

urlpatterns = [
    path('register/', RegisterView.as_view()),

    # JWT LOGIN
    # path('login/', TokenObtainPairView.as_view()),
    path('login/', CustomLoginView.as_view()),

    # TOKEN REFRESH
    path('token/refresh/', TokenRefreshView.as_view()),

    path('profile/', ProfileView.as_view()),
    # path('api/token/', TokenObtainPairView.as_view()),
]