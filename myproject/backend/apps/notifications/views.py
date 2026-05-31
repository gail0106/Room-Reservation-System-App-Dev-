# apps/notifications/views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.notifications.services import create_notification
from .models import Notification, PushSubscription
from .serializers import NotificationSerializer
from django.conf import settings


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_list(request):
    notifications = Notification.objects.filter(
        user=request.user
    ).order_by("-created_at")
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_vapid_public_key(request):
    return Response({
        'public_key': settings.WEBPUSH_SETTINGS['VAPID_PUBLIC_KEY']
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'all notifications marked as read'})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_push_subscription(request):
    data = request.data
    subscription = data.get('subscription', {})
    keys = subscription.get('keys', {})

    PushSubscription.objects.update_or_create(
        endpoint=subscription.get('endpoint'),
        defaults={
            'user': request.user,
            'p256dh': keys.get('p256dh', ''),
            'auth': keys.get('auth', ''),
        }
    )
    return Response({'status': 'subscribed'}, status=201)