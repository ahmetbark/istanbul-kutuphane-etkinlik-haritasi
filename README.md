# İstanbul Kütüphane Atlası

2025 İBB kütüphane etkinlik ve katılım verileri için statik, Türkçe bir interaktif harita.

## Açma

ZIP dosyasını çıkarın ve Windows’ta `HARITAYI-AC.cmd` dosyasına çift tıklayın. Site tarayıcıda http://localhost:8765/ adresinde (doluysa sonraki boş portta) açılır. Açılan komut penceresini kullanırken açık tutun; pencereyi kapatınca yerel sunucu kapanır. Python, Node veya API anahtarı gerekmez. Başlatıcı yalnızca kendi bilgisayarınızın loopback adresinde dosyaları sunar.

`index.html` dosyasını doğrudan açarsanız harita zemini kullanılmaz ve başlatıcı yönergesi gösterilir; filtreler ve veriler kullanılabilir. Bu, dosya adresinden yapılan isteklerin OpenStreetMap tarafından kaynak adresi bulunmadığı için 403 ile engellenmesini önler. Statik web barındırıcısında başlatıcıya ihtiyaç yoktur. Leaflet 1.9.4 pakete dahildir; OpenStreetMap harita zemini internet bağlantısı ister. İnternet olmadan göstergeler, filtreler ve liste çalışır; harita zemini yüklenmez.

## Özellikler

- 38 kütüphane, 25 ilçe; 550 etkinlik, 10.039 katılımcı.
- İlçe, kütüphane adı ve minimum etkinlik filtreleri.
- Seçime göre güncellenen göstergeler; ağırlıklı oran = toplam katılım / toplam etkinlik.
- Katılımcı sayısıyla büyüyen noktalar; etkinlik, katılım veya katılım/etkinlik ile renklendirme.
- Renk ölçeği karşılaştırmayı korumak için tüm veri setine göre sabittir.
- Kütüphane kartları, kaynak bağlantıları, mobil görünüm, klavye ile seçilebilir liste ve noktalar.

## Dosyalar

`index.html`, `style.css`, `app.js`: arayüz ve etkileşimler.
`data.csv`: kullanıcının orijinal CSV dosyası.
`data.js`: CSV metni ve koordinatların gömülü kopyası; dosya çift tıklamayla açıldığında da CSV ayrıştırılır, yerel fetch kısıtlaması oluşmaz.
`coordinates.json`: her satırın koordinatı, resmi kaynak URL'si ve konum açıklaması.
`vendor/`: Leaflet 1.9.4 ve BSD-2-Clause lisansı.
`preview-*.png`: kontrol edilmiş masaüstü ve mobil görünümler.

## Kaynak ve sınırlamalar

Etkinlik ve katılım sayıları yalnızca yüklenen CSV'den alınmıştır. Katılım, benzersiz ziyaretçi sayısı olmayabilir. 2025 yılına ait etkinlik ayrıntıları, nüfus, kapasite ve koordinatlar CSV'de bulunmaz; bu nedenle kalite, kişi başına erişim veya nedensellik çıkarımı yapılmaz.

38 konum, 6 Ekim 2026 tarihinde İBB Atatürk Kitaplığı kütüphane sayfalarındaki Google Maps iframe koordinatlarından alınmıştır:
https://ataturkkitapligi.ibb.gov.tr/tr/Kitaplik/Kutuphanelerimiz

Bunlar resmi sayfalardaki harita görünüm koordinatlarıdır; bina girişleri bağımsız olarak doğrulanmamıştır ve 2025'teki konumu kesin olarak belgelemeyebilir. İlçeler CSV'den korunmuştur. İsim farklılıkları (Attila/Attilâ, Samiha/Sâmiha, İskele/İskelesi gibi) açık eşleştirmelerle çözümlenmiştir. Her satırın kaynak bağlantısı `coordinates.json` içinde ve açılan kartta yer alır.

Harita zemini © OpenStreetMap katkıda bulunanlar, ODbL: https://www.openstreetmap.org/copyright
Leaflet: https://leafletjs.com
### Etkinlik ve katılım verisi atfı

Bilgi sağlayıcı: İstanbul Büyükşehir Belediyesi (İBB).
Kaynak portal: [İBB Açık Veri Portalı](https://data.ibb.gov.tr/dataset/).
Veri: kullanıcı tarafından sağlanan 2025 kütüphane etkinlik ve katılım CSV dosyası.

Atıf 4.0 Uluslararası (CC BY 4.0) kapsamında lisanslanan kamu sektörü bilgilerini içerir.
[CC BY 4.0 lisans metni](https://creativecommons.org/licenses/by/4.0/deed.tr).

Kaynak etkinlik ve katılım sayıları korunmuş; katılımcı/etkinlik oranı hesaplanmış, konum bilgileri eklenmiş ve veriler görselleştirilmiştir. Veri atfı uygulamanın bütün koduna veya ayrı kaynaklardan alınan konum bilgilerine otomatik bir lisans atamaz.

## Veriyi güncelleme / yayınlama

`data.csv` değiştiğinde `data.js` içindeki `window.LIBRARY_CSV` metnini de aynı içerikle güncelleyin. Yeni satırlar için `_id` anahtarına bağlı koordinat ekleyin. JSON ve CSV'nin yanında gömülü kopyaların da güncel kalması gerekir. Orijinal sütun adlarını koruyun. Nokta boyutları mevcut 2025 veri setindeki maksimum katılıma (2.400) göre ölçeklidir.

Klasörün tamamını herhangi bir statik web barındırıcısına yükleyebilirsiniz. Backend veya derleme gerekmez. Harita yoğun trafikli ticari kullanım için OSM tile kullanım politikasıyla değerlendirilmelidir: https://operations.osmfoundation.org/policies/tiles/
