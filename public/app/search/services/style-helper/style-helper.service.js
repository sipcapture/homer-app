class StyleHelper {
  constructor() {
  }

  getCallIDColor(str) {
    if (!str) {
      return str;
    }

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let col = ((hash >> 24) & 0xAF).toString(16) + ((hash >> 16) & 0xAF).toString(16) +
    ((hash >> 8) & 0xAF).toString(16) + (hash & 0xAF).toString(16);

    if (col.length < 6) {
      col = col.substring(0, 3) + '' + col.substring(0, 3);
    }
    if (col.length > 6) {
      col = col.substring(0, 6);
    }
    return {
      color: '#' + col,
    };
  }

  getCallStatusColor(value, rowIsSelected, transaction) {
    const status = parseInt(value);
    let color = 'white';

    if (transaction === 'call') {
      if (rowIsSelected) {
        switch (status) {
        case 1:
          color = '#CC1900';
          break;
        case 2:
          color = '#FF3332';
          break;
        case 3:
          color = '#B8F2FF';
          break;
        case 4:
          color = '#B8F2FF';
          break;
        case 5:
          color = '#44c51a';
          break;
        case 6:
          color = '#D7CAFA';
          break;
        case 7:
          color = '#FFF6BA';
          break;
        case 8:
          color = 'F41EC7';
          break;
        case 9:
          color = 'F41EC7';
          break;
        case 10:
          color = '#186600';
          break;
        case 11:
          color = '#FFF6BA';
          break;
        case 12:
          color = '#FF7F7E';
          break;
        case 13:
          color = '#FF7F7E';
          break;
        case 14:
          color = 'F41EC7';
          break;
        case 15:
          color = 'F41EC7';
          break;
        default:
          color = 'FFF6BA';
        }
      } else {
        switch (status) {
        case 1:
          color = '#9E1E1E';
          break;
        case 2:
          color = '#FF3332';
          break;
        case 3:
          color = '#DDF8FD';
          break;
        case 4:
          color = '#DDF8FD';
          break;
        case 5:
          color = '#44c51a';
          break;
        case 6:
          color = '#E7DDFD';
          break;
        case 7:
          color = '#CCB712';
          break;
        case 8:
          color = '##BC270B';
          break;
        case 9:
          color = '#CEB712';
          break;
        case 10:
          color = '#186600';
          break;
        case 11:
          color = '#CEB712';
          break;
        case 12:
          color = '#FF9F9E';
          break;
        case 13:
          color = '#FF9F9E';
          break;
        case 14:
          color = '#CDB712';
          break;
        case 15:
          color = '#FDE2DD';
          break;
        default:
          color = 'FFF6BA';
        }
      }
    }
    return {
      'color': color,
    };
  }

  getMosColor(rowmos) {
    const mos = parseInt(rowmos / 100);
    if (mos <= 2) {
      return {
        'color': 'red',
      };
    } else if (mos <= 3) {
      return {
        'color': 'orange',
      };
    } else {
      return {
        'color': 'green',
      };
    }
  }
}

export default StyleHelper;
