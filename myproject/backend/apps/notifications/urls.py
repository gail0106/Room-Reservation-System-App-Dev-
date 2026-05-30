# apps/notifications/urls.py

from django.urls import path
from .views import NotificationListView, mark_all_read, get_vapid_public_key, save_push_subscription

urlpatterns = [
    path('', NotificationListView.as_view()),
    path('mark-all-read/', mark_all_read),
    path('vapid-public-key/', get_vapid_public_key),
    path('subscribe/', save_push_subscription),
]