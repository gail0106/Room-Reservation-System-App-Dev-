from django.urls import path
from .views import RoomListCreateView, RoomRetrieveUpdateDestroyView, AvailableRoomsView

urlpatterns = [
    path('', RoomListCreateView.as_view(), name='room-list-create'),
    path('available/', AvailableRoomsView.as_view(), name='available-rooms'),
    path('<int:pk>/', RoomRetrieveUpdateDestroyView.as_view(), name='room-detail'),
]