from rest_framework import generics
from .models import Room
from .serializers import RoomSerializer
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdmin

from apps.reservations.models import Reservation
from rest_framework.views import APIView
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

class RoomListCreateView(generics.ListCreateAPIView):

    queryset = Room.objects.all()

    serializer_class = RoomSerializer

    filter_backends = [DjangoFilterBackend]

    filterset_fields = ['capacity', 'location']


    def get_permissions(self):

        # GET request → any authenticated user
        if self.request.method == 'GET':
            return [IsAuthenticated()]  

        # POST request → admin only
        return [IsAuthenticated(), IsAdmin()]
    
class AvailableRoomsView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        start_time = request.query_params.get('start_time')
        end_time = request.query_params.get('end_time')

        conflicting_reservations = Reservation.objects.filter(
            status='approved',
            start_time__lt=end_time,
            end_time__gt=start_time
        ).values_list('room_id', flat=True)

        available_rooms = Room.objects.exclude(
            id__in=conflicting_reservations
        )

        serializer = RoomSerializer(available_rooms, many=True)

        return Response(serializer.data)