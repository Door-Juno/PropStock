import pandas as pd
from django.core.management.base import BaseCommand
from sales.models import Sales
import os

class Command(BaseCommand):
    help = 'Export sales data to a CSV file for AI model training.'

    def handle(self, *args, **options):
        self.stdout.write('Starting sales data export...')

        # 모든 판매 데이터 조회
        sales_records = Sales.objects.all().select_related('item')
        
        if not sales_records.exists():
            self.stdout.write(self.style.WARNING('No sales data found to export.'))
            return

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

        # CSV 파일 저장 경로 설정 (ai/data/all_sales_data.csv)
        # 이 파일은 backend 컨테이너 내의 /app/ 디렉토리를 기준으로 경로를 잡아야 함
        # docker-compose.yml에서 backend와 ai 디렉토리가 모두 /app 아래에 마운트된다고 가정
        output_dir = '/app/ai/data'
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, 'all_sales_data.csv')

        # CSV 파일로 저장
        df.to_csv(output_path, index=False)

        self.stdout.write(self.style.SUCCESS(f'Successfully exported {len(df)} records to {output_path}'))
