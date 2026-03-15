from django.shortcuts import render, redirect
from django.db.models import Q
from .models import Asset
from .forms import AssetForm
import base64
from django.core.files.base import ContentFile

def home(request):
    # 🔥 GET-параметры из URL
    search_query = request.GET.get('q', '').strip()
    ordering = request.GET.get('ordering', 'new')
    
    # Базовый запрос
    assets = Asset.objects.all()
    
    # 🔥 ПОИСК
    if search_query:
        assets = assets.filter(title__icontains=search_query)
    
    # 🔥 СОРТИРОВКА
    if ordering == 'old':
        assets = assets.order_by('created_at')
    elif ordering == 'name':
        assets = assets.order_by('title')
    else:  # new (по умолчанию)
        assets = assets.order_by('-created_at')
    
    context_data = {
        'page_title': f'Галерея 3D моделей ({assets.count()})',
        'assets': assets,
        'search_query': search_query,
        'ordering': ordering,
    }
    return render(request, 'gallery/index.html', context_data)

def about(request):
    return render(request, 'gallery/about.html')

def upload(request):
    return render(request, 'gallery/upload.html')


def upload(request):
    if request.method == 'POST':
        form = AssetForm(request.POST, request.FILES)
        if form.is_valid():
            new_asset = form.save(commit=False)
            
            # 🔥 Base64 картинка (может отсутствовать)
            image_data = request.POST.get('image_data', None)
            if image_data:
                try:
                    # Убираем data:image/jpeg;base64,
                    if ';base64,' in image_data:
                        format, imgstr = image_data.split(';base64,')
                        ext = format.split('/')[-1]  # jpeg
                        data = base64.b64decode(imgstr)
                        file_name = f"{new_asset.title}_thumb.{ext}"
                        new_asset.image.save(file_name, ContentFile(data), save=False)
                except Exception as e:
                    print(f"Ошибка обработки картинки: {e}")
                    # Продолжаем без картинки
            
            new_asset.save()
            return redirect('home')
    
    else:
        form = AssetForm()
    
    return render(request, 'gallery/upload.html', {'form': form})

