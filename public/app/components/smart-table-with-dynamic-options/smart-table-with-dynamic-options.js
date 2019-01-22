import { cloneDeep } from 'lodash';
import swal from 'sweetalert2';
import uuid from 'uuid/v1';

export default class SmartTableWithDynamicOptions {
  constructor($uibModal, $state, $log) {
    'ngInject';
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.$log = $log;
    this.smartTable = {
      options: {
        pagination: '',
        items_by_page: 10,
        displayed_pages: 7,
      },
    };
  }

  createEmptyRow() {
    const row = {};
    Object.keys(this.tableData[0]).forEach(k => {
      row[k] = undefined;
    });
    row.guid = uuid();
    return row;
  }

  addRow() {
    this.$uibModal.open({
      component: 'smartTableWithDynamicOptionsEdit',
      resolve: {
        row: () => this.createEmptyRow(),
      },
    }).result.then((row) => {
      this.onAddRow({ row });
    });
  }

  editRow(row) {
    this.$uibModal.open({
      component: 'smartTableWithDynamicOptionsEdit',
      resolve: {
        row: () => row,
      },
    }).result.then((row) => {
      this.onEditRow({ row, guid: row.guid });
    });
  }

  deleteRow(row) {
    swal.fire({
      type: 'warning',
      title: 'Delete row?',
      text: 'Once deleted, you will not be able to recover this!',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((res) => {
      if (res.dismiss !== 'cancel') {
        this.onDeleteRow({ row, guid: row.guid });
      }
    });
  }
}
