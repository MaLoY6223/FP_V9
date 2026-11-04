/* ============================================================
                        COINKEEPER
   ============================================================ */

const iconsTop = 
[
    {
        icon: 'image_svg/top_panel/banknote.svg',
        name: 'banknote',
        type: 'cash',
        values: '0₽',
        title: 'Наличные' 
    },

    {
        icon: 'image_svg/top_panel/bitcoin.svg',
        name: 'bitcoin',
        type: 'crypto',
        values: '0₽',
        title: 'Крипта'
    },

    {
        icon: 'image_svg/top_panel/dollar-sign.svg',
        name: 'dollar',
        type: 'currency',
        values: '0$',
        title: 'Доллар'
    },

    {
        icon: 'image_svg/top_panel/credit-card-plus.svg',
        name: 'card',
        type: 'card',
        values: '0₽',
        title: 'Карта'
    },

    {
        icon: 'image_svg/top_panel/piggy-bank.svg',
        name: 'piggy',
        type: 'savings',
        values: '0₽',
        title: 'Копилка'
    },

    {
        icon: 'image_svg/top_panel/wallet.svg',
        name: 'wallet',
        type: 'wallet',
        values: '0₽',
        title: 'Кошелёк'
    },
]

const iconsMidle = 
[
    {
        icon: 'image_svg/midle_panel/biceps-flexed.svg',
        name: 'biceps-flexed',
        type: 'sport',
        values: '0₽',
        title: 'Спорт'
    },

    {
        icon: 'image_svg/midle_panel/bone.svg',
        name: 'bone',
        type: 'pets',
        values: '0₽',
        title: 'Питомец'
    },

    {
        icon: 'image_svg/midle_panel/car.svg',
        name: 'car',
        type: 'transport',
        values: '0₽',
        title: 'Машина'
    },

    {
        icon: 'image_svg/midle_panel/graduation-cap.svg',
        name: 'graduation-cap',
        type: 'education',
        values: '0₽',
        title: 'Учеба'
    },

    {
        icon: 'image_svg/midle_panel/house.svg',
        name: 'house',
        type: 'services',
        values: '0₽',
        title: 'Услуги'
    },

    {
        icon: 'image_svg/midle_panel/plane.svg',
        name: 'plane',
        type: 'travel',
        values: '0₽',
        title: 'Путешествия'
    },

    {
        icon: 'image_svg/midle_panel/smartphone.svg',
        name: 'smartphone',
        type: 'utilities',
        values: '0₽',
        title: 'Телефон'
    },

    {
        icon: 'image_svg/midle_panel/wifi.svg',
        name: 'wifi',
        type: 'utilities',
        values: '0₽',
        title: 'Интернет'
    },
]

const users = 
{
  user1: {  name: "Admin", email: 'Admin@gmail.com' },
}

/* ============================================================
   ДЕНЬГИ
   ============================================================ */

function parseValue(str) 
{
    const s = String(str)
    const amount = parseFloat(s.replace(',', '.')) || 0
    return { amount: amount, currency: s.replace(/[\d.,]/g, '') || '₽' }
}

function formatValue(amount, currency) 
{
    return amount + currency
}

/* ============================================================
   ОКНО ВВОДА СУММЫ
   ============================================================ */

function askAmount(title, defaultValue) 
{
    return new Promise(function (resolve) 
    {
        const backdrop = document.createElement('div')
        backdrop.classList.add('transfer-backdrop')

        const modal = document.createElement('div')
        modal.classList.add('transfer-modal')

        const h3 = document.createElement('h3')
        h3.innerText = title

        const input = document.createElement('input')
        input.type = 'number'
        input.value = defaultValue

        const okBtn = document.createElement('button')
        okBtn.innerText = 'ОК'

        const cancelBtn = document.createElement('button')
        cancelBtn.innerText = 'Отмена'

        modal.append(h3, input, okBtn, cancelBtn)
        backdrop.append(modal)
        document.body.append(backdrop)

        input.addEventListener('keydown', function (e) 
        {
            if (e.key === 'Enter') okBtn.click()
        })

        okBtn.addEventListener('click', function () 
        {
            const val = parseFloat(input.value)
            backdrop.remove()
            if (isNaN(val) || val <= 0) resolve(null)
            else resolve(val)
        })

        cancelBtn.addEventListener('click', function () 
        {
            backdrop.remove()
            resolve(null)
        })
    })
}

/* ============================================================
   ПОПОЛНИТЬ СЧЁТ
   ============================================================ */

async function depositFunds(item) 
{
    const data = item._data
    const val = parseValue(data.values)

    const add = await askAmount('Пополнить ' + data.title, 0)
    if (add === null) return

    const total = val.amount + add
    data.values = formatValue(total, val.currency)
    data.valueEl.innerText = data.values
}

/* ============================================================
   ПЕРЕВОД МЕЖДУ СЧЕТАМИ
   ============================================================ */

async function transferFunds(from, to) 
{
    const a = from._data
    const b = to._data

    const aVal = parseValue(a.values)
    const bVal = parseValue(b.values)

    const amount = await askAmount('Перевод: ' + a.title + ' -> ' + b.title, 0)
    if (amount === null) return
    if (amount > aVal.amount) return

    aVal.amount = aVal.amount - amount
    bVal.amount = bVal.amount + amount

    a.values = formatValue(aVal.amount, aVal.currency)
    b.values = formatValue(bVal.amount, bVal.currency)

    a.valueEl.innerText = a.values
    b.valueEl.innerText = b.values
}

/* ============================================================
   СОЗДАНИЕ ЯЧЕЙКИ
   ============================================================ */

function createItem(data) 
{
    const item = document.createElement('div')
    item.classList.add('item')

    const name = document.createElement('span')
    name.classList.add('circle-name')
    name.innerText = data.title

    const circle = document.createElement('div')
    circle.classList.add('circle')

    const img = document.createElement('img')
    img.src = data.icon
    img.classList.add('circle-icon')
    img.draggable = false
    circle.append(img)

    const value = document.createElement('span')
    value.classList.add('circle-value')
    value.innerText = data.values

    item.append(name, circle, value)

    item._data = data
    data.valueEl = value

    circle.addEventListener('dblclick', function () {
        depositFunds(item)
    })


/* ============================================================
   DRAG & DROP
   ============================================================ */

    let isDrag = null;
    let offsetX;/*Смещение курсора относительно элемента по X*/
    let offsetY;/*Смещение курсора относительно элемента по Y*/

    const Pleft = getComputedStyle(circle).left
    const Ptop = getComputedStyle(circle).top

    circle.addEventListener("mousedown", function(e)
    {
    isDrag = true;
    circle.style.position = 'fixed'
    offsetX = e.pageX - parseInt(getComputedStyle(circle).left);
    offsetY = e.pageY - parseInt(getComputedStyle(circle).top);  
    })/*Вешаем обработчик прямо на элемент*/

    document.addEventListener("mouseup", function(){ isDrag = false;
        circle.style.left = Pleft;
        circle.style.top = Ptop;
        circle.style.position = 'static'
    }) 
    document.addEventListener("mousemove",/*Оставшиеся обработчики вешаем на сам документ*/
    function(e) 
    {
        if (isDrag) 
        { 
            circle.style.left = `calc(${e.pageX}px - ${offsetX}px)`;
            circle.style.top = `calc(${e.pageY}px - ${offsetY}px)`;
        }
    }) 

    return item
}

/* ============================================================
   СБОРКА ПРИЛОЖЕНИЯ
   ============================================================ */

    const container = document.createElement('div')
    container.classList.add('function-container')

    const foot = document.createElement('div')
    foot.classList.add('foot')
    for (let i = 0; i < iconsTop.length; i++) 
        foot.append(createItem(iconsTop[i]))

    const hr = document.createElement('hr')

    const mid = document.createElement('div')
    mid.classList.add('mid')
    for (let i = 0; i < iconsMidle.length; i++) 
        mid.append(createItem(iconsMidle[i]))

    container.append(foot, hr, mid)
    document.body.append(container)



   
        
 