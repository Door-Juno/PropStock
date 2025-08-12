import pandas as pd
from django.core.management.base import BaseCommand
from sales.models import Sales
from users.models import Store  # Store 모델 임포트
import os

class Command(BaseCommand):
    help = 'Export sales data for each store to separate CSV files for AI model training.'

    def handle(self, *args, **options):
        self.stdout.write('Starting sales data export for all stores...')

        stores = Store.objects.all()
        if not stores.exists():
            self.stdout.write(self.style.WARNING('No stores found in the database.'))
            return

        output_dir = '/app/ai/data'
        os.makedirs(output_dir, exist_ok=True)

        for store in stores:
            self.stdout.write(f'--- Processing store: {store.name} (ID: {store.id}) ---')
            
            # 해당 가게의 판매 데이터만 조회
            sales_records = Sales.objects.filter(store=store).select_related('item')
            
            if not sales_records.exists():
                self.stdout.write(self.style.WARNING(f'No sales data found for store {store.name}. Skipping.'))
                continue

            # 데이터를 리스트로 변환
            data = list(sales_records.values(
                'date', 
                'quantity', 
                'item__item_code', # Product 모델의 item_code
                'is_event_day'
            ))

            # Pandas DataFrame 생성
            df = pd.DataFrame(data)

            # AI 모델 학습에 필요한 컬럼명으로 변경
            df.rename(columns={
                'date': 'ds',
                'quantity': 'y',
                'item__item_code': 'item_code'
            }, inplace=True)

            # Prophet은 날짜 형식이 datetime이어야 함
            df['ds'] = pd.to_datetime(df['ds'])

            # 가게별로 별도의 CSV 파일 저장
            output_path = os.path.join(output_dir, f'sales_data_store_{store.id}.csv')
            df.to_csv(output_path, index=False)

            self.stdout.write(self.style.SUCCESS(f'Successfully exported {len(df)} records to {output_path}'))

        self.stdout.write(self.style.SUCCESS('All stores processed.'))
