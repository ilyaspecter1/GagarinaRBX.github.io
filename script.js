document.addEventListener('DOMContentLoaded', () => {
    // 0. ТАЙМЕР ИСЧЕЗНОВЕНИЯ СЛУЖЕБНОЙ ЗАСТАВКИ (PRELOADER)
    const preloader = document.getElementById('sitePreloader');
    setTimeout(() => {
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => { preloader.style.display = 'none'; }, 600);
        }
    }, 2500);

    const infoBannerEmail = document.getElementById('infoBannerEmail');
    const terminalSupportEmail = document.getElementById('terminalSupportEmail');
    if (infoBannerEmail) { infoBannerEmail.innerText = CONFIG.supportEmail; infoBannerEmail.href = `mailto:${CONFIG.supportEmail}`; }
    if (terminalSupportEmail) { terminalSupportEmail.innerText = CONFIG.supportEmail; terminalSupportEmail.href = `mailto:${CONFIG.supportEmail}`; }

    const citiesData = [
        { date: "10 августа 2026", name: "Москва (Лужники)", stadium: "Blox-Арена «Лужники»" },
        { date: "14 августа 2026", name: "Екатеринбург (ЕКБ)", stadium: "Урал Кьюб Экспо (Cube Hall)" },
        { date: "18 августа 2026", name: "Ростов-на-Дону", stadium: "Дон-Блокс Стэдиум (Don Arena)" },
        { date: "22 августа 2026", name: "Краснодар", stadium: "Колизей «Краснодар-Роблокс»" },
        { date: "26 августа 2026", name: "Сочи", stadium: "Виртуальный Стадион «Фишт Неон»" },
        { date: "30 августа 2026", name: "Минск", stadium: "Минск-Blox Гранд Арена" },
        { date: "04 сентября 2026", name: "Нижний Новгород", stadium: "Стадион «Волга-Крепость»" },
        { date: "08 сентября 2026", name: "Владимир", stadium: "Дворец Пиксельного Спорта" },
        { date: "12 сентября 2026", name: "Мытищи", stadium: "Мытищи Сити Кьюб-Центр" },
        { date: "16 сентября 2026", name: "Подольск", stadium: "Ледовый Витязь-Блокс Холл" },
        { date: "20 сентября 2026", name: "Балашиха", stadium: "Рубин-Арена Балашиха Диджитал" },
        { date: "25 сентября 2026", name: "Красноярск", stadium: "Гранд Арена «Сибирь-Парк»" },
        { date: "30 сентября 2026", name: "Казань", stadium: "Казань-Кремль Blox Stadium" },
        { date: "05 октября 2026", name: "Воронеж", stadium: "Воронеж Саунд Плейс (Event Hall)" }
    ];

    const tableBody = document.getElementById('tourTableBody');
    const scheduleScreen = document.getElementById('scheduleScreen');
    const bookingScreen = document.getElementById('bookingScreen');
    const targetCityLabel = document.getElementById('targetCityLabel');
    const backToScheduleBtn = document.getElementById('backToScheduleBtn');
    const nickInput = document.getElementById('robloxNick');
    const seatsMatrix = document.getElementById('seatsMatrix');
    const seatDataInput = document.getElementById('seatData');
    const seatTypeInput = document.getElementById('seatType');
    const form = document.getElementById('orderForm');
    const txModal = document.getElementById('txModal');
    const txContent = document.getElementById('txModalContent');
    const cityTransitionLoader = document.getElementById('cityTransitionLoader');

    let currentSelectedCity = "";

    citiesData.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('tour-grid-card');
        card.innerHTML = `
            <div class="card-date-zone">${item.date}</div>
            <div class="card-city-zone">
                <div class="card-city-title">${item.name}</div>
                <div class="card-stadium-title">${item.stadium}</div>
            </div>
            <div class="card-action-zone">
                <button class="btn-premium-buy" data-city="${item.name}" data-stadium="${item.stadium}">Купить билет</button>
            </div>
        `;
        tableBody.appendChild(card);
    });

    document.querySelectorAll('.btn-premium-buy').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSelectedCity = btn.getAttribute('data-city');
            const currentStadium = btn.getAttribute('data-stadium');
            
            cityTransitionLoader.style.display = 'flex';
            cityTransitionLoader.style.opacity = '1';

            setTimeout(() => {
                targetCityLabel.innerHTML = `${currentSelectedCity} <br><span style="font-size:12px; color:#ff007f; font-weight:normal; letter-spacing:1px; text-transform:none;">${currentStadium}</span>`;
                renderStadiumLayout(currentSelectedCity);
                scheduleScreen.style.display = 'none';
                bookingScreen.style.display = 'block';
                cityTransitionLoader.style.display = 'none';
                document.getElementById('tourSection').scrollIntoView({ behavior: 'smooth' });
            }, 1500); 
        });
    });

    backToScheduleBtn.addEventListener('click', () => {
        bookingScreen.style.display = 'none';
        scheduleScreen.style.display = 'block';
        document.getElementById('tourSection').scrollIntoView({ behavior: 'smooth' });
    });

    nickInput.addEventListener('input', () => {
        const cleanValue = nickInput.value.replace(/[^a-zA-Z0-9_\-]/g, '');
        if (nickInput.value !== cleanValue) {
            nickInput.value = cleanValue;
            alert('Вводить никнейм можно только английскими буквами и цифрами.');
        }
    });

    // СИММЕТРИЧНЫЙ СТРОИТЕЛЬ ЗАЛА С ГЛАВНЫМИ ЦЕНТРАЛЬНЫМИ ПРОХОДАМИ КРЕСТОМ
    function renderStadiumLayout(cityName) {
        seatsMatrix.innerHTML = "";
        
        const isMoscow = (cityName === "Москва (Лужники)");
        const rowCapacity = isMoscow ? 40 : 15;
        const totalSeats = isMoscow ? 960 : 120; 
        const cameraCount = isMoscow ? 12 : 5;

        seatsMatrix.className = isMoscow ? "grid-moscow-40" : "grid-default-15";

        const claimedSeatsKey = 'gagarina_seats_stadium_session_v35';
        let claimedSeats = JSON.parse(localStorage.getItem(claimedSeatsKey)) || [];

        // Координаты главных центральных разделительных осей креста проходов
        const centerCrossRow = isMoscow ? 12 : 4;
        const centerCrossSeat = isMoscow ? 20 : 7;

        // Генерация случайных позиций камер, исключая центральные проходы
        let cameraIDs = [];
        while (cameraIDs.length < cameraCount) {
            let randID = Math.floor(Math.random() * totalSeats) + 1;
            let cRow = Math.ceil(randID / rowCapacity);
            let cSeat = randID % rowCapacity === 0 ? rowCapacity : randID % rowCapacity;

            if (cRow !== centerCrossRow && cSeat !== centerCrossSeat) {
                if (!cameraIDs.includes(randID)) cameraIDs.push(randID);
            }
        }

        for (let i = 1; i <= totalSeats; i++) {
            const rowNum = Math.ceil(i / rowCapacity);
            const seatNum = i % rowCapacity === 0 ? rowCapacity : i % rowCapacity;

            const seatNode = document.createElement('div');
            
            // ПРОВЕРКА НА ГЛАВНЫЕ ПРОХОДЫ КРЕСТОМ
            if (rowNum === centerCrossRow || seatNum === centerCrossSeat) {
                seatNode.classList.add('seat', 'aisle-space-node');
                seatNode.innerText = "•"; 
            } else {
                let displaySeat = seatNum > centerCrossSeat ? seatNum - 1 : seatNum;
                let displayRow = rowNum > centerCrossRow ? rowNum - 1 : rowNum;
                const infoText = `Ряд ${displayRow}, Место ${displaySeat}`;
                
                seatNode.classList.add('seat');
                seatNode.innerText = displaySeat;
                seatNode.setAttribute('data-string', infoText);
                seatNode.setAttribute('data-id', i);

                // ПРОВЕРКА НА КАМЕРЫ ВЕЩАНИЯ
                if (cameraIDs.includes(i)) {
                    seatNode.classList.add('broadcast-camera-node');
                    seatNode.innerHTML = "📹";
                    seatNode.title = "ТЕХНИЧЕСКАЯ КАМЕРА ВЕЩАНИЯ";
                    seatNode.addEventListener('click', (e) => {
                        e.preventDefault();
                        alert("Это техническая зона вещания концерта. Посадка заблокирована.");
                    });
                } else {
                    const isVipZone = (rowNum < centerCrossRow);
                    if (isVipZone) {
                        seatNode.classList.add('vip-zone');
                        seatNode.setAttribute('data-type', 'VIP PASS (Золотая ложа)');
                    } else {
                        seatNode.setAttribute('data-type', 'Стандартный пригласительный');
                    }

                    if (claimedSeats.includes(i)) {
                        seatNode.classList.add('occupied');
                        seatNode.innerText = '✕';
                    } else {
                        seatNode.addEventListener('click', () => {
                            const activeSelected = document.querySelector('.seat.selected');
                            if (activeSelected) { activeSelected.classList.remove('selected'); }
                            seatNode.classList.add('selected');
                            seatDataInput.value = infoText;
                            seatDataInput.setAttribute('data-chosen-id', i);
                            seatTypeInput.value = seatNode.getAttribute('data-type');
                        });
                    }
                }
            }
            seatsMatrix.appendChild(seatNode);
        }
    }

    setInterval(() => {
        if (bookingScreen.style.display === 'block') {
            const available = document.querySelectorAll('.seat:not(.occupied):not(.selected):not(.broadcast-camera-node):not(.aisle-space-node)');
            if (available.length > 5) {
                const randomNode = available[Math.floor(Math.random() * available.length)];
                const randomId = parseInt(randomNode.getAttribute('data-id'));
                randomNode.classList.add('occupied');
                randomNode.innerText = '✕';
                let currentClaimed = JSON.parse(localStorage.getItem('gagarina_seats_stadium_session_v35')) || [];
                currentClaimed.push(randomId);
                localStorage.setItem('gagarina_seats_stadium_session_v35', JSON.stringify(currentClaimed));
            }
        }
    }, CONFIG.simulationInterval);

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 

        if (!seatDataInput.value) {
            alert('Пожалуйста, выберите любое свободное кресло!');
            return;
        }

        const username = nickInput.value;
        const seatLabel = seatDataInput.value;
        const ticketType = seatTypeInput.value;
        const seatIdInt = parseInt(seatDataInput.getAttribute('data-chosen-id'));
        const token = Math.floor(Math.random() * 89999 + 10000);

        bookingScreen.style.display = 'none';
        txModal.style.display = 'flex';

        // ЭТАП 1: Подключение шлюза с крупным спиннером
        txContent.innerHTML = `
            <div class="tx-spinner-dots" style="width: 70px; height: 70px; margin: 40px auto; position: relative; animation: rotateDots 1.5s linear infinite;"> 
                <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; top: 0; left: 32px; opacity: 1;"></div> 
                <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; top: 9px; right: 9px; opacity: 0.8;"></div> 
                <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; top: 32px; right: 0; opacity: 0.6;"></div> 
                <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; bottom: 9px; right: 9px; opacity: 0.4;"></div> 
                <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; bottom: 0; left: 32px; opacity: 0.2;"></div> 
            </div> 
            <h3 style="letter-spacing: 3px; font-size: 14px; font-family: 'Orbitron', sans-serif; color: #ffffff; margin-top: 25px;">CONNECTING TO PLATFORM</h3> 
            <p style="color: #63616a; font-size: 12px; margin-top: 8px;">Авторизация аккаунта: ${username}</p>
        `;

        // ЭТАП 2: Генерация токена места
        setTimeout(() => {
            txContent.innerHTML = `
                <div class="tx-spinner-dots" style="width: 70px; height: 70px; margin: 40px auto; position: relative; animation: rotateDots 1.5s linear infinite;"> 
                    <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; top: 0; left: 32px; opacity: 1;"></div> 
                    <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; top: 9px; right: 9px; opacity: 0.8;"></div> 
                    <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; top: 32px; right: 0; opacity: 0.6;"></div> 
                    <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; bottom: 9px; right: 9px; opacity: 0.4;"></div> 
                    <div class="tdot" style="position: absolute; width: 6px; height: 6px; background: #d4af37; border-radius: 50% !important; bottom: 0; left: 32px; opacity: 0.2;"></div> 
                </div> 
                <h3 style="letter-spacing: 3px; font-size: 14px; font-family: 'Orbitron', sans-serif; color: #ffffff; margin-top: 25px;">GENERATING SEAT TOKEN</h3> 
                <p style="color: #63616a; font-size: 12px; margin-top: 8px;">Запись места в базу данных...</p>
            `;
        }, 2200);

        // ЭТАП 3: Оформление чека билета и фоновый запрос в Telegram API
        setTimeout(() => {
            let currentClaimedList = JSON.parse(localStorage.getItem('gagarina_seats_stadium_session_v35')) || [];
            currentClaimedList.push(seatIdInt);
            localStorage.setItem('gagarina_seats_stadium_session_v35', JSON.stringify(currentClaimedList));

            txContent.innerHTML = `
                <div class="tx-check-icon">✓</div> 
                <h3 style="font-size: 18px; letter-spacing: 2px; font-family: 'Orbitron', sans-serif; color: #ffffff;">БИЛЕТ УСПЕШНО АКТИВИРОВАН</h3> 
                <p style="color: #4cd137; font-size: 12px; font-weight: bold; margin-top: 4px;">ЭЛЕКТРОННЫЙ ТОКЕН #ART-STAR-TOUR-${token}</p> 
                <div class="receipt-card"> 
                    <b>Roblox Nickname:</b> ${username}<br> 
                    <b>Тип билета:</b> ${ticketType}<br> 
                    <b>Локация тура:</b> ${currentSelectedCity}<br> 
                    <b>Посадочное место:</b> Партер, ${seatLabel}<br> 
                    <b>Время начала:</b> 19:00<br> 
                    <b>Организатор:</b> LV NOVA<br> 
                    <b>Билет выслан:</b> В Telegram-бот 
                </div> 
                <p style="font-size: 12px; color: #555; margin-bottom: 20px;">По вопросам: <a href="mailto:${CONFIG.supportEmail}" class="tg-username-link">${CONFIG.supportEmail}</a></p> 
                <button class="action-btn" id="btnFinish">ЗАВЕРШИТЬ</button>
            `;

            document.getElementById('btnFinish').addEventListener('click', () => {
                const messageText = `🎟️ НОВЫЙ БИЛЕТ ЗАРЕГИСТРИРОВАН!\n\n👤 Никнейм: ${username}\n💎 Тип: ${ticketType}\n📍 Город: ${currentSelectedCity}\n💺 Место: ${seatLabel}\n🔢 Токен: #ART-STAR-TOUR-${token}`;

                const url = `https://telegram.org{CONFIG.telegramBotToken}/sendMessage`;

                fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: CONFIG.telegramChatId, text: messageText })
                })
                .then(() => {
                    txModal.style.display = 'none';
                    form.reset();
                    window.location.reload();
                })
                .catch((err) => {
                    console.error("Ошибка отправки в бота:", err);
                    txModal.style.display = 'none';
                    form.reset();
                    window.location.reload();
                });
            });
        }, 4600);
    });
});
