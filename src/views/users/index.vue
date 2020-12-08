<template>
  <div class="components-container">
    <div class="filter-container">
      <el-input v-model="listQuery.filter.search" placeholder="Nhập từ ..." style="width: 200px; margin-left: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.filter.roles" style="margin-left: 10px;" placeholder="Chọn vai trò" class="filter-item" multiple clearable>
        <el-option v-for="role in roleLists" :key="role.id" :label="role.name" :value="role.name" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-left: 10px" type="primary" icon="el-icon-search" @click="handleFilter">
        Lọc
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        Tạo
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Xuất
      </el-button>
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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" sortable="custom" label="Tên" prop="name">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" sortable="custom" label="Email" prop="email">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Vai trò" width="120">
        <template slot-scope="{row}">
          <template v-if="row.roles.length > 0">
            <el-tag v-for="role in row.roles" :key="role.id" type="success">
              <span>{{ role }}</span>
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="Thao tác" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Sửa
          </el-button>
          <el-popconfirm
            confirm-button-text="OK"
            cancel-button-text="Hủy"
            icon="el-icon-info"
            icon-color="red"
            title="Bạn có chắc muốn xóa không?"
            @onConfirm="handleDelete(row,$index)"
          >
            <el-button slot="reference" size="mini" type="danger">Xoá</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-drawer :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" custom-class="demo-drawer" size="40%">
      <div class="demo-drawer__content">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px">
          <el-form-item label="Tên" prop="name" :error="formErrors.name">
            <el-input v-model="temp.name" />
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
          <el-form-item label="Vai trò" prop="roles">
            <el-select v-model="temp.roles" placeholder="Chọn vai trò" multiple clearable :error="formErrors.roles">
              <el-option v-for="role in roleLists" :key="role.id" :label="role.name" :value="role.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="Quyền" prop="direct_permissions">
            <el-select v-model="temp.direct_permissions" placeholder="Chọn vai trò" multiple clearable :error="formErrors.direct_permissions">
              <el-option v-for="permission in permissionLists" :key="permission.id" :label="permission.name" :value="permission.name" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="demo-drawer__footer">
          <el-button @click="dialogFormVisible = false">
            Hủy
          </el-button>
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
            Chấp nhận
          </el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style>
.el-drawer__body {
    padding: 20px !important;
}

.demo-drawer__content {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.demo-drawer__footer {
    display: flex;
}
.demo-drawer__footer button {
    flex: 1;
}

.demo-drawer__content form {
    flex: 1;
}

.el-drawer > header > span:focus {
outline-color: white;
}
.el-drawer > header > button:focus {
outline-color: white;
}
.el-drawer > header > button:hover {
color: rgb(64, 158, 255);
}

</style>
<script>
import { createUser, updateUser, fetchRoles, fetchPermissions, deleteUser } from '@/api/users'
import User from '@/models/User'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

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
  name: 'Users',
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
      roleLists: [],
      permissionLists: [],
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
          roles: []
        },
        include: 'roles,permissions'
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

    fetchRoles().then(response => {
      const roleLists = response.data.map(role => {
        return {
          id: role.id,
          name: role.name
        }
      })
      this.roleLists = roleLists
    })

    fetchPermissions().then(response => {
      const permissionLists = response.data.map(permission => {
        return {
          id: permission.id,
          name: permission.name
        }
      })
      this.permissionLists = permissionLists
    })
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    getList() {
      this.listLoading = true
      User.include('roles', 'permissions')
        .where('search', this.listQuery.filter.search)
        .whereIn('roles', this.listQuery.filter.roles)
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
        message: '操作Success',
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
