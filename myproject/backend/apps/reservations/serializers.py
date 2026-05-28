from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ['user']

class CalendarReservationSerializer(serializers.ModelSerializer):

    title = serializers.CharField(source='room.name')

    start = serializers.DateTimeField(source='start_time')

    end = serializers.DateTimeField(source='end_time')

    class Meta:
        model = Reservation
        fields = [
            'id',
            'title',
            'start',
            'end',
            'status'
        ]