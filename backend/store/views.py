from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated # 인증된 사용자만 접근 가능
from .models import Store
from .serializers import StoreSerializer

class StoreRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    # GET /store/ (조회) 및 PUT/PATCH /store/ (수정)을 처리하는 뷰
    queryset = Store.objects.all() # 쿼리셋은 모든 Store 객체를 대상으로 합니다.
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated] # ✨ 인증 필요 ✨

    # 매장은 일반적으로 한 사용자/프로젝트당 하나이거나,
    # 사용자와 연결된 특정 매장을 조회/수정할 것이므로,
    # Primary Key (PK)를 URL에서 받는 대신 특정 로직으로 매장을 가져와야 합니다.
    # 명세에 /store/ 라고 되어 있으므로, PK 없이 요청을 처리해야 합니다.

    def get_object(self):
        # 여기서는 현재 인증된 사용자가 접근할 수 있는 "매장" 객체를 반환해야 합니다.
        # 예를 들어, 한 사용자에게 하나의 매장만 연결되어 있다면:
        # return self.request.user.owned_stores.first()
        # 또는 프로젝트 전체에서 단일 매장을 관리한다면:
        # return Store.objects.first() # 가장 간단한 예시 (단일 매장만 존재한다고 가정)

        # 예시: 가장 ID가 낮은 매장 (단일 매장 시나리오에 적합)
        return Store.objects.order_by('store_id').first()

        # 실제 프로젝트에서는 로그인한 사용자와 매장을 연결하거나,
        # 특정 필드 (예: "default_store")로 필터링하는 로직이 필요합니다.
        # if not store:
        #     raise Http404("No store found for this user/criteria.")
        # return store