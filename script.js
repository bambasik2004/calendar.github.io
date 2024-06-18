var Cal = function(divId) {
  this.divId = divId;
  this.DaysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  this.Months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  var d = new Date();
  this.currMonth = d.getMonth();
  this.currYear = d.getFullYear();
  this.currDay = d.getDate();
  this.selectedDate = null;
};

Cal.prototype.nextMonth = function() {
  if (this.currMonth == 11) {
    this.currMonth = 0;
    this.currYear += 1;
  } else {
    this.currMonth += 1;
  }
  this.showcurr();
};

Cal.prototype.previousMonth = function() {
  if (this.currMonth == 0) {
    this.currMonth = 11;
    this.currYear -= 1;
  } else {
    this.currMonth -= 1;
  }
  this.showcurr();
};

Cal.prototype.showcurr = function() {
  this.showMonth(this.currYear, this.currMonth);
};

Cal.prototype.showMonth = function(y, m) {
  var firstDayOfMonth = new Date(y, m, 1).getDay();
  firstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
  var lastDateOfMonth = new Date(y, m + 1, 0).getDate();
  var lastDayOfLastMonth = m === 0 ? new Date(y - 1, 11, 0).getDate() : new Date(y, m, 0).getDate();

  var html = '<table>';
  html += '<thead><tr>';
  html += '<td colspan="7">' + this.Months[m] + ' ' + y + '</td>';
  html += '</tr></thead>';
  html += '<tr class="days">';
  for (var i = 0; i < this.DaysOfWeek.length; i++) {
    html += '<td>' + this.DaysOfWeek[i] + '</td>';
  }
  html += '</tr>';

  var i = 1;
  do {
    var dow = new Date(y, m, i).getDay();
    dow = (dow === 0) ? 6 : dow - 1;

    if (dow == 0) {
      html += '<tr>';
    } else if (i == 1) {
      html += '<tr>';
      var k = lastDayOfLastMonth - firstDayOfMonth + 1;
      for (var j = 0; j < firstDayOfMonth; j++) {
        html += '<td class="not-current">' + k + '</td>';
        k++;
      }
    }

    var className = "normal";
    if (this.selectedDate && y === this.currYear && m === this.currMonth && i === this.currDay) {
      className = "selected";
    }

    html += '<td class="' + className + '" onclick="selectDate(' + i + ')">' + i + '</td>';

    if (dow == 6) {
      html += '</tr>';
    } else if (i == lastDateOfMonth) {
      var k = 1;
      for (dow; dow < 6; dow++) {
        html += '<td class="not-current">' + k + '</td>';
        k++;
      }
      html += '</tr>';
    }

    i++;
  } while (i <= lastDateOfMonth);

  html += '</table>';

  document.getElementById(this.divId).innerHTML = html;
  if (this.selectedDate) {
    document.getElementById('selectedDate').innerText = 'Выбранная дата: ' + this.selectedDate;
  }
};

var currentCalendar;

window.onload = function() {
  currentCalendar = new Cal("divCal");			
  currentCalendar.showcurr();

  getId('btnNext').onclick = function() {
    currentCalendar.nextMonth();
  };
  getId('btnPrev').onclick = function() {
    currentCalendar.previousMonth();
  };
}

function getId(id) {
  return document.getElementById(id);
}

function selectDate(day) {
  currentCalendar.selectedDate = day + ' ' + currentCalendar.Months[currentCalendar.currMonth] + ' ' + currentCalendar.currYear;
  currentCalendar.currDay = day;
  currentCalendar.showcurr();

  const calendarData = {
    day: currentCalendar.currDay,
    month: currentCalendar.currMonth,
    year: currentCalendar.currYear
  };

  Telegram.WebApp.sendData(JSON.stringify(calendarData));
}