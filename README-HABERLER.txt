REZONANSLAR – HABERLER BÖLÜMÜ (10.10.2026)

KOPYALANACAK DOSYALAR:
- index.html (ana sayfadaki eski 10 kartlık Sanatçılar alanı Haberler ile değiştirildi)
- css/news.css (haber alanının tasarımı)
- js/news-data.js (tüm haberlerin yönetileceği tek dosya)
- js/news.js (haber kartları, kategori filtreleri, TR/EN)

Bu paketi GitHub Desktop → Repository → Show in Explorer ile açılan
rezonanslar-website kök klasörüne kopyalayın. index.html üzerine yazmayı onaylayın.
Mevcut css/style.css, js/site.js, artists/ dosyaları ve hero kartları değiştirilmez.

HABER EKLEME:
js/news-data.js dosyasını bir metin düzenleyicide açın. Dizideki örneklerle aynı
formatta yeni haber nesnesi ekleyin. type=release|social|studio.
status=plan; yayımlandığı doğrulanmamış tarihler "Yayın takvimi" olarak görünür.
Yayınlandığı doğrulanınca status="news" kullanabilirsiniz.
url alanına sadece gerçek, erişilebilir bağlantı yazın. Bağlantı henüz yoksa url="".

Başlangıç içerikleri, önceden konuşulan yayın takvimi bilgisidir; gerçekleşmiş
yayın veya sosyal medya gönderisi olarak sunulmaz. Sosyal medya kartlarını
hesap / paylaşım URL'leri kesinleşince ekleyin.

COMMIT: feat: replace homepage artists grid with news feed
