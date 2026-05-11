# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser): # Inherit from AbstractUser to use Django's built-in user model features
    ROLE_CHOICES = (
    ('admin', 'Admin'),
    ('teacher', 'Teacher'),
    ('student', 'Student'),
    )
    role = models.CharField(
    max_length=20,
    choices=ROLE_CHOICES,
    default='student'
    )
