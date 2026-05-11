from rest_framework import serializers, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User
from .utils import api_response
from rest_framework import generics
from .serializers import RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(api_response(
            success=True,
            message="User registered successfully",
            data={
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        ))


class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        return Response(api_response(
            success=True,
            message="Profile fetched successfully",
            data={
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        ))
class CustomLoginView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):

        response = super().post(request, *args, **kwargs)

        username = request.data.get("username")
        user = User.objects.get(username=username)

        return Response(api_response(
            success=True,
            message="Login successful",
            data={
                "tokens": response.data,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role
                }
            }
        ))