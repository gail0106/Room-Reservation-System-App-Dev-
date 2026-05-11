from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User



class CustomUserAdmin(UserAdmin):
    model = User

    # show role in list view
    list_display = ('id', 'username', 'email', 'role', 'is_staff', 'is_active')

    # allow filtering by role
    list_filter = ('role', 'is_staff', 'is_active')

    # fields when editing a user
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role',)}),
    )

    # fields when creating a user
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role',)}),
    )
admin.site.register(User, CustomUserAdmin)