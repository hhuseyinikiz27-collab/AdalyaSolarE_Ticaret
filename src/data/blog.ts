export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: string;
  authorTitle: string;
  date: string;
  readTime: number;
  imageUrl: string;
  tags: string[];
}

export const blogCategories = [
  'Kurulum Rehberi',
  'Ürün İncelemeleri',
  'Teknoloji',
  'Tasarruf İpuçları',
  'Sektör Haberleri',
];

export const blogPosts: BlogPost[] = [
  {
    slug: 'evde-gunes-enerjisi-sistemi-kurulum-rehberi',
    title: 'Evde Güneş Enerjisi Sistemi Kurulum Rehberi',
    excerpt:
      'Evinize güneş enerjisi sistemi kurmadan önce bilmeniz gereken her şey: panel sayısı hesaplama, yerleşim seçimi ve kurulum adımları.',
    category: 'Kurulum Rehberi',
    author: 'Ahmet Yılmaz',
    authorTitle: 'Solar Enerji Uzmanı',
    date: '2026-04-15',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=675&fit=crop',
    tags: ['kurulum', 'güneş paneli', 'on-grid', 'tasarruf'],
    content: [
      'Güneş enerjisi sistemleri artık Türkiye\'de hem bireysel hem de kurumsal kullanıcılar için en mantıklı enerji yatırımlarından biri haline geldi. Elektrik faturalarındaki sürekli artış ve güneş sistemi fiyatlarının düşmesiyle birlikte amortisman süreleri 4-6 yıla kadar geriledi.',
      'Kurulum öncesinde yapmanız gereken ilk şey aylık ortalama elektrik tüketiminizi hesaplamaktır. Son 12 aylık faturanızı inceleyerek ortalama kWh değerinizi belirleyin. Türkiye\'de ortalama bir konut yılda 3.000-4.500 kWh elektrik tüketir.',
      'Panel sayısını belirlemek için şu formülü kullanabilirsiniz: İhtiyaç duyulan panel sayısı = Aylık kWh tüketimi ÷ (Panel gücü (kWp) × Günlük ortalama güneşlenme saati × 30). Antalya gibi güneşli bölgelerde günlük ortalama 5-5,5 saat güneşlenme hesaplanabilir.',
      'Çatı yönü kritik öneme sahiptir. En verimli kurulum güneye bakan çatılarda 30-35 derece eğimle gerçekleştirilir. Güneybatı ve güneydoğu yönleri de kabul edilebilir düzeyde verim sağlar; ancak verim yaklaşık %10-15 düşebilir.',
      'On-grid (şebekeye bağlı) sistemler Türkiye\'de en yaygın tercih olmaya devam etmektedir. Bu sistemlerde ürettiğiniz fazla enerjiyi şebekeye satabilir, gece veya bulutlu havalarda şebekeden elektrik çekebilirsiniz. YEKDEM kapsamındaki lisanssız üretim için TEDAŞ\'a başvurmanız gerekmektedir.',
      'Kurulum için mutlaka lisanslı bir elektrik mühendisi veya yetkili montaj firması çalıştırın. Elektrik bağlantı ve topraklama işlemleri hatalı yapıldığında ciddi güvenlik riskleri oluşabilir. Adalya Solar olarak tüm kurulum projelerinizde ücretsiz teknik danışmanlık hizmeti sunuyoruz.',
    ],
  },
  {
    slug: '2026-gunes-enerjisi-fiyatlari-ve-tesvikler',
    title: '2026\'da Güneş Enerjisi Fiyatları ve Devlet Teşvikleri',
    excerpt:
      'Güneş enerjisi sistemlerinin 2026 fiyatları, YEKDEM destekleri ve konut başvurularında dikkat edilmesi gerekenler.',
    category: 'Sektör Haberleri',
    author: 'Elif Demir',
    authorTitle: 'Enerji Politikaları Danışmanı',
    date: '2026-03-28',
    readTime: 6,
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&h=675&fit=crop',
    tags: ['fiyatlar', 'teşvik', 'YEKDEM', 'devlet desteği'],
    content: [
      '2026 yılında güneş paneli fiyatları bir önceki yıla göre ortalama %12 geriledi. Monokristalin panel fiyatları Watt başına 1,8-2,5 TL bandına indi. 10 kWp kapasiteli anahtar teslim bir konut sistemi artık 180.000-250.000 TL aralığında kurulabilmektedir.',
      'Enerji ve Tabii Kaynaklar Bakanlığı\'nın YEKDEM (Yenilenebilir Enerji Kaynaklarını Destekleme Mekanizması) kapsamında 1 MW\'a kadar lisanssız üretim yapılabilmekte ve fazla üretim şebekeye verilebilmektedir. 2026 yılı için belirlenen güneş enerjisi alım fiyatı kWh başına 8,5 cent seviyesindedir.',
      'Konut başvurularında TEDAŞ bölge müdürlüğünüze bağlantı başvurusu yapmanız gerekiyor. Başvuru sürecinde tek hat şeması, teknik hesaplamalar ve enerji verimliliği belgesi talep ediliyor. Onay süreci ortalama 30-45 gün sürmektedir.',
      'Bazı belediyeler ve kalkınma ajansları ek teşvikler sunmaktadır. Özellikle Güneydoğu ve İç Anadolu bölgelerindeki kalkınma ajansları küçük ölçekli güneş yatırımları için hibe ve düşük faizli kredi imkânları sağlıyor.',
      'KOBİ\'ler için KOSGEB\'in enerji verimliliği destek programı kapsamında güneş enerjisi yatırımları için %50\'ye kadar geri ödemesiz hibe alınabiliyor. Başvuru koşulları ve hibe miktarları her yıl güncellenmekte olup KOSGEB\'in resmi web sitesinden güncel bilgilere ulaşabilirsiniz.',
    ],
  },
  {
    slug: 'lityum-vs-agm-batarya-karsilastirmasi',
    title: 'LiFePO4 vs AGM Batarya: Hangisi Doğru Seçim?',
    excerpt:
      'Güneş enerjisi depolama sistemleri için lityum (LiFePO4) ve AGM bataryaları karşılaştırıyoruz; maliyet, ömür ve performans açısından.',
    category: 'Ürün İncelemeleri',
    author: 'Murat Kaya',
    authorTitle: 'Elektrik-Elektronik Mühendisi',
    date: '2026-03-10',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&h=675&fit=crop',
    tags: ['batarya', 'lityum', 'AGM', 'enerji depolama'],
    content: [
      'Güneş enerjisi sistemlerinde enerji depolamanın önemi her geçen gün artıyor. Şebeke bağlantısı olmayan off-grid sistemlerde batarya seçimi tüm sistemin verimliliğini doğrudan etkilerken, hibrit sistemlerde de doğru batarya tercihi yatırımın geri dönüşünü önemli ölçüde etkiliyor.',
      'AGM (Absorbent Glass Mat) bataryalar yıllardır sektörde kullanılan güvenilir bir teknolojidir. Birim başına maliyet düşüklüğü en büyük avantajlarından biridir. Ancak kullanılabilir kapasite nominal kapasitenin yalnızca %50\'si kadardır (DoD %50). Yani 100 Ah\'lik bir AGM bataryadan güvenle 50 Ah kullanabilirsiniz.',
      'LiFePO4 (Lityum Demir Fosfat) bataryalar ise nominal kapasitenin %80-90\'ına kadar kullanılmasına olanak tanır. Aynı kullanılabilir kapasiteyi elde etmek için AGM\'ye kıyasla daha küçük boyutlu bir batarya bankası yeterli olur. Ağırlık avantajı da dikkat çekicidir; LiFePO4 bataryalar AGM\'ye göre yaklaşık 3-4 kat daha hafiftir.',
      'Ömür açısından karşılaştırıldığında AGM bataryalar 500-800 döngü ömrüne sahipken LiFePO4 bataryalar 3.000-6.000 döngüye kadar çıkabilmektedir. Günlük şarj-deşarj döngüsü hesaplandığında AGM\'de 2-3 yıl, LiFePO4\'de ise 8-15 yıl ömür beklenebilir.',
      'İlk yatırım maliyeti açısından LiFePO4 bataryalar AGM\'den 3-4 kat daha pahalıdır. Ancak uzun vadeli toplam sahip olma maliyeti (TCO) hesaplandığında LiFePO4\'ün genellikle daha ekonomik olduğu görülmektedir. Özellikle uzak konumlarda veya sürekli kullanım gerektiren sistemlerde LiFePO4 tercih edilmelidir.',
      'Sonuç olarak bütçe kısıtlı ve düşük döngü sayısı gerektiren sistemler için AGM makul bir seçimdir. Uzun ömür, düşük bakım ve yüksek verimlilik öncelikliyse LiFePO4 bataryalar açık ara üstün performans sunar. Pylontech, CATL ve BYD bu alanda en güvenilir markalar arasında yer almaktadır.',
    ],
  },
  {
    slug: 'on-grid-off-grid-hibrit-sistem-farklari',
    title: 'On-Grid, Off-Grid ve Hibrit Sistemler: Hangisi Size Uygun?',
    excerpt:
      'Şebekeye bağlı, bağımsız ve hibrit güneş enerjisi sistemlerinin farkları, avantajları ve hangi durumda tercih edilmesi gerektiği.',
    category: 'Teknoloji',
    author: 'Ahmet Yılmaz',
    authorTitle: 'Solar Enerji Uzmanı',
    date: '2026-02-20',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=675&fit=crop',
    tags: ['on-grid', 'off-grid', 'hibrit', 'sistem tasarımı'],
    content: [
      'Güneş enerjisi sistemi kurarken karşılaşılan en önemli kararlardan biri sistem tipinin belirlenmesidir. On-grid (şebekeye bağlı), off-grid (şebekeden bağımsız) ve hibrit sistemlerin her birinin farklı kullanım senaryoları, avantajları ve dezavantajları bulunmaktadır.',
      'On-Grid Sistemler: Şebekeye bağlı sistemler Türkiye\'de en yaygın tercih edilen tiptir. Bu sistemlerde güneş panellerinden üretilen elektrik önce evde tüketilir, fazlası şebekeye verilir. Şebeke bir "sonsuz batarya" gibi işlev görür. Batarya gerektirmediğinden kurulum maliyeti düşük, bakım neredeyse sıfırdır. Ana dezavantajı şebeke kesintilerinde çalışmamasıdır.',
      'Off-Grid Sistemler: Şebekeden tamamen bağımsız sistemler genellikle şebeke altyapısının olmadığı uzak konumlarda (dağ evi, çiftlik, tekne) tercih edilir. Yeterli kapasitede batarya bankası ve yedek jeneratör gerektirirler. Sistem tasarımı en kötü koşullar (kışın en az güneşli dönem) göz önünde bulundurularak yapılmalıdır. Kurulum maliyeti on-grid sistemlere göre 2-3 kat daha yüksektir.',
      'Hibrit Sistemler: Her iki sistemin avantajlarını birleştiren hibrit sistemler giderek popüler hale geliyor. Hem şebekeye bağlı çalışır hem de batarya depolama içerir. Şebeke kesintilerinde otomatik olarak batarya moduna geçerler. Elektrik fiyatlarının düşük olduğu saatlerde bataryayı şebekeyle de şarj edebilirsiniz. Growatt, Deye ve SolarEdge hibrit inverter segmentinde öne çıkan markalar arasındadır.',
      'Hangi sistemi seçeceğiniz önceliklerinize bağlıdır. Şebekeye güveniyorsanız ve maksimum tasarrufu minimum maliyetle elde etmek istiyorsanız on-grid en mantıklı seçenektir. Şebeke güvenilirliği düşükse veya enerji bağımsızlığı istiyorsanız hibrit sisteme yönelin. Şebeke yoksa off-grid dışında seçeneğiniz bulunmuyor demektir.',
    ],
  },
  {
    slug: 'gunes-paneli-verimlilik-artirma-ipuclari',
    title: 'Güneş Paneli Verimini Artırmanın 7 Yolu',
    excerpt:
      'Mevcut güneş panellerinizden maksimum verim almak için uygulayabileceğiniz pratik ipuçları ve bakım önerileri.',
    category: 'Tasarruf İpuçları',
    author: 'Zeynep Arslan',
    authorTitle: 'Enerji Verimliliği Danışmanı',
    date: '2026-02-05',
    readTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&h=675&fit=crop',
    tags: ['verimlilik', 'bakım', 'temizlik', 'optimizasyon'],
    content: [
      'Güneş panellerinizin maksimum verimle çalışması için düzenli bakım ve bazı pratik önlemler büyük fark yaratabilir. Uzmanlar bakımlı bir sistemin bakımsıza göre yıllık %10-25 daha fazla üretim yapabildiğini belirtiyor.',
      '1. Düzenli Temizlik: Panel yüzeylerindeki toz, kuş pisliği ve yaprak birikintileri üretimi ciddi ölçüde düşürür. Yılda en az 2-3 kez, tercihen sabahın erken saatlerinde veya akşamüstü ılık suyla temizlik yapın. Sert fırça ve kimyasal deterjanlardan kaçının; yumuşak bez veya özel panel temizleme ekipmanları kullanın.',
      '2. Gölgelenmeyi Önleme: Panel yüzeyinin küçük bir bölümünün bile gölgelenmesi tüm dizinin üretimini orantısız biçimde düşürebilir. Çevre ağaçlarını budayın, hava koşullarının getirdiği kiri düzenli temizleyin ve panel üzerinde herhangi bir cisim bırakmaktan kaçının.',
      '3. İnverter İzleme: Modern inverterler gerçek zamanlı üretim verileri sunar. Growatt ve SolarEdge gibi markaların mobil uygulamaları sayesinde günlük, haftalık ve aylık üretim raporlarını takip edebilirsiniz. Ani üretim düşüşleri teknik arıza işareti olabilir.',
      '4. Kablo ve Bağlantı Kontrolü: Yılda bir kez kablo bağlantılarını ve MC4 konektörleri kontrol edin. Gevşek veya korozyona uğramış bağlantılar hem verim kaybına hem de yangın riskine yol açar. Bu kontrolü mutlaka yetkili bir teknisyene yaptırın.',
      '5. Optimizatör veya Mikro İnverter Kullanımı: Kısmi gölgelenme sorununuz varsa panel bazında optimizatörler veya mikro inverterlere geçmeyi değerlendirin. SolarEdge optimizatörleri karma gölge koşullarında sisteminizden %25\'e kadar ek verim sağlayabilir.',
      '6. Panel Sıcaklığını Düşürme: Paneller ısındıkça verimleri düşer; tipik olarak her 1°C artış için %0,3-0,5 verim kaybı oluşur. Çatı yüzeyi ile paneller arasında hava sirkülasyonuna olanak tanıyan montaj sistemleri tercih edin.',
      '7. Yıllık Teknik Bakım: Yılda bir kez yetkili servis tarafından gerçekleştirilen kapsamlı bakım; inverter güncelleme, topraklama ölçümü, termal kamera taraması ve verimlilik testini kapsar. Bu yatırım uzun vadede büyük tasarruf sağlar.',
    ],
  },
  {
    slug: 'inverter-secimi-rehberi-dogru-kapasite',
    title: 'İnverter Seçimi Rehberi: Doğru Kapasite Nasıl Belirlenir?',
    excerpt:
      'String, mikro ve hibrit inverterler arasındaki farklar, doğru kapasite hesaplama yöntemleri ve marka karşılaştırması.',
    category: 'Kurulum Rehberi',
    author: 'Murat Kaya',
    authorTitle: 'Elektrik-Elektronik Mühendisi',
    date: '2026-01-18',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=675&fit=crop',
    tags: ['inverter', 'kapasite', 'Growatt', 'SMA', 'Fronius'],
    content: [
      'İnverter, güneş panellerinin ürettiği DC (doğru akım) elektriği AC\'ye (alternatif akım) dönüştüren ve sistemin "beyni" olarak kabul edilen en kritik bileşendir. Yanlış inverter seçimi sistemin tüm performansını olumsuz etkileyebilir.',
      'İnverter Tipleri: String inverterler birden fazla paneli seri bağlayarak tek bir merkezi üniteye bağlar. En yaygın ve ekonomik tiptir. Mikro inverterler ise her panelin arkasına takılır; panel bazında bağımsız optimizasyon sağlar. Karma gölge koşulları veya farklı yönlü çatılar için idealdir. Hibrit inverterler hem şebeke bağlantısını hem de batarya şarjını yönetir.',
      'Kapasite Hesaplama: İnverter kapasitesi panel dizisinin toplam gücüne eşit veya %10-20 daha düşük olabilir. Bu "over-sizing" (panel fazlaması) pratikte üretimi olumsuz etkilemez çünkü paneller yalnızca kısa süreliğine tam kapasitede çalışır. Örneğin 10 kWp panelden oluşan bir dizi için 8-10 kW kapasiteli inverter uygundur.',
      'Verimlilik: Kaliteli inverterler %97-98 Euro verimine sahiptir. Bu rakam düşük güç seviyelerinde de yüksek verimlilik anlamına gelir. Ucuz inverterlerde bu değer %93-95\'e kadar düşebilir; yıllık üretim kaybı binlerce kWh\'e ulaşabilir.',
      'Marka Karşılaştırması: Growatt ve Deye fiyat-performans oranıyla öne çıkan Çin menşeli markalardır. SMA ve Fronius Alman mühendisliğinin ürünü olup en güvenilir markalar arasında gösterilir; fiyatları daha yüksektir ancak uzun vadeli güvenilirlik açısından üstündür. SolarEdge optimizatör sistemiyle birlikte panel bazında izleme ve maksimum verim sunmaktadır. Victron Energy ise off-grid ve hibrit sistemlerde tercih edilen uzman bir marka olarak öne çıkmaktadır.',
      'Garanti ve Servis: İnverter seçiminde garanti süresi kritik bir etkendir. SMA ve Fronius standart olarak 5-10 yıl garanti sunarken uzatılmış garanti seçenekleri mevcuttur. Türkiye\'de yetkili servis ağının varlığı, arıza durumunda çözüm süresini doğrudan etkiler. Adalya Solar tüm markalarda satış sonrası teknik destek sağlamaktadır.',
    ],
  },
];
