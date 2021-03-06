<template>
  <div class="components-container">
    <div class="filter-container">
      <el-input v-model="listQuery.filter.search" placeholder="Nhập từ ..." style="width: 200px; margin-left: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.filter.province_id" style="margin-left: 10px;" placeholder="Tỉnh thành phô" class="filter-item" filterable clearable>
        <el-option v-for="province in provinces" :key="province.id" :label="province.name_with_type" :value="province.id" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-left: 10px" type="primary" icon="el-icon-search" circle @click="handleFilter" />
      <el-button class="filter-item" type="success" icon="el-icon-circle-plus" circle @click="handleCreate" />
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="info" icon="el-icon-download" circle @click="handleDownload" />
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column label="STT" type="index" align="center" width="80" />
      <el-table-column label="Tên nhà" prop="name" sortable="custom" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" label="Số phòng" prop="rooms_count">
        <template slot-scope="{row}">
          <el-tag type="danger">
            <span>{{ row.rooms_count }} phòng</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" label="Chỗ trống" prop="room_left_counts">
        <template slot-scope="{row}">
          <el-tag type="danger">
            <span>{{ row.rooms_count }} phòng</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" label="Địa chỉ" prop="address">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Chủ sở hữu" prop="landlord.id">
        <template slot-scope="{row}">
          <span>{{ row.landlord.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Số điện thoại" prop="landlord.phone_number">
        <template slot-scope="{row}">
          <span>{{ row.landlord.phone_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Email" prop="landlord.email">
        <template slot-scope="{row}">
          <span>{{ row.landlord.email }}</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="Thao tác" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" icon="el-icon-edit" circle @click="handleUpdate(row)" />
          <el-popconfirm
            confirm-button-text="OK"
            cancel-button-text="Hủy"
            icon="el-icon-info"
            icon-color="red"
            title="Bạn có chắc muốn xóa không?"
            @onConfirm="handleDelete(row,$index)"
          >
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-width="150px">
        <el-form-item label="Tên" prop="name" :error="formErrors.name" placeholder="Nhập tên nhà">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Loại nhà">
          <el-select v-model="temp.name" placeholder="Chọn loại nhà">
            <el-option label="Zone one" value="shanghai" />
            <el-option label="Zone two" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="Hình thức">
          <el-select v-model="temp.name" placeholder="Chọn hình thức cho thuê">
            <el-option label="Zone one" value="shanghai" />
            <el-option label="Zone two" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="Email" prop="email" :error="formErrors.email">
          <el-input v-model="temp.email" type="email" />
        </el-form-item>
        <el-form-item label="Mật khẩu" prop="password" :required="dialogStatus==='create'?true:false" :error="formErrors.password">
          <el-input v-model="temp.password" type="password" />
        </el-form-item>
        <el-form-item label="Nhập lại mật khẩu" prop="password_confirmation" :required="dialogStatus==='create'?true:false">
          <el-input v-model="temp.password_confirmation" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Hủy
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Thêm mới
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createUser, updateUser, deleteUser } from '@/api/users'
import House from '@/models/House'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapState } from 'vuex'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Houses',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Vui lòng nhập mật khẩu'))
      }
      if (this.temp.password_confirmation !== '') {
        this.$refs.dataForm.validateField('password_confirmation')
      }
      callback()
    }

    var validatePassAgain = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Vui lòng nhập lại mật khẩu'))
      } else if (value !== this.temp.password) {
        callback(new Error('Mật khẩu không khớp'))
      } else {
        callback()
      }
    }

    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        sort: '+id',
        filter: {
          search: '',
          province_id: ''
        }
      },
      temp: {
        id: undefined,
        name: '',
        email: '',
        roles: [],
        permissions: [],
        direct_permissions: [],
        password: '',
        password_confirmation: '',
        is_active: true
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Chỉnh sửa',
        create: 'Tạo mới'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [
          { required: true, message: 'Vui lòng nhập tên', trigger: 'change' },
          { min: 3, max: 255, message: 'Tên nằm trong khoảng 3 đến 255 ký tự', trigger: 'change' }
        ],
        email: [
          { required: true, message: 'Vui lòng nhập email', trigger: 'change' },
          { type: 'email', message: 'Email không hợp lệ', trigger: 'change' },
          { max: 255, message: 'Email tối đa 255 ký tự', trigger: 'change' }
        ],
        roles: [{ required: true, message: 'Vui lòng chọn ít nhất 1 vai trò', trigger: 'change' }],
        password: [
          { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự', trigger: 'change' },
          { validator: validatePass, trigger: 'blur' }
        ],
        password_confirmation: [
          { validator: validatePassAgain, trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      formErrors: {
        name: null,
        email: null,
        password: null,
        roles: null,
        direct_permissions: null
      },
      selectedRows: []
    }
  },
  created() {
    this.getList()
  },
  computed: {
    ...mapState('commons', {
      provinces: state => state.provinces
    })
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    getList() {
      this.listLoading = true
      House.include('type', 'typeRent', 'rooms_count', 'landlord')
        .where('search', this.listQuery.filter.search)
        .where('province_id', this.listQuery.filter.province_id)
        .page(this.listQuery.page)
        .limit(this.listQuery.limit)
        .orderBy(this.listQuery.sort)
        .get()
        .then(response => {
          this.list = response.data
          this.total = response.meta.total
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: 'Thành công',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (order === null) {
        this.listQuery.sort = '-created_at'
      } else {
        if (order === 'ascending') {
          this.listQuery.sort = prop
        } else {
          this.listQuery.sort = '-' + prop
        }
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        email: '',
        roles: [],
        permissions: [],
        direct_permissions: [],
        password: '',
        password_confirmation: '',
        is_active: true
      }
    },
    resetErrors() {
      this.formErrors = {
        name: null,
        email: null,
        password: null,
        roles: null,
        direct_permissions: null
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.resetErrors()
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUser(this.temp).then((response) => {
            const { data } = response
            this.list.unshift(data)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Thành công',
              message: 'Thêm mới thành công',
              type: 'success',
              duration: 2000
            })
          }).catch(error => {
            const errors = error.response.data.errors
            Object.keys(errors).forEach((key) => {
              this.formErrors[key] = errors[key][0]
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.resetErrors()
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateUser(tempData.id, tempData).then((response) => {
            const { data } = response
            const index = this.list.findIndex(v => v.id === data.id)
            this.list.splice(index, 1, data)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Thành công',
              message: 'Cập nhật thành công',
              type: 'success',
              duration: 2000
            })
          }).catch((error) => {
            const errors = error.response.data.errors
            console.log(error.response.data.errors)
            Object.keys(errors).forEach((key) => {
              this.formErrors[key] = errors[key][0]
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteUser(row.id).then((response) => {
        this.$notify({
          title: 'Thành công',
          message: 'Xoá thành công!',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
