import { defineStore } from 'pinia'

const INSURANCE_CONFIG_STORAGE_KEY = 'salary-payment-insurance-config'
const SALARY_CONFIG_STORAGE_KEY = 'salary-payment-config'

const createDefaultInsuranceConfig = () => ({
  pension: { personal: 8, company: 16 },
  medical: { personal: 2, company: 8 },
  unemployment: { personal: 0.5, company: 0.5 },
  injury: { personal: 0, company: 0.2 },
  maternity: { personal: 0, company: 0.8 },
  housingFund: { personal: 12, company: 12 }
})

const createDefaultTaxConfig = () => ({
  threshold: 5000,
  brackets: [
    { start: 5000, end: 8000, rate: 3 },
    { start: 8000, end: 17000, rate: 10 },
    { start: 17000, end: 30000, rate: 20 },
    { start: 30000, end: 40000, rate: 25 },
    { start: 40000, end: 60000, rate: 30 },
    { start: 60000, end: 85000, rate: 35 },
    { start: 85000, end: null, rate: 45 }
  ]
})

const normalizeRangeValue = (value, allowNull = false) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return allowNull ? null : 0
  }

  if (allowNull && numberValue === 0) {
    return null
  }

  return numberValue
}

const convertLegacyUpperLimitBrackets = (sourceBrackets = [], threshold = 5000) => {
  let previousUpper = threshold

  return sourceBrackets.map((item, index) => {
    const upper = normalizeRangeValue(item?.upperLimit, true)
    const absoluteUpper = upper == null ? null : threshold + upper
    const current = {
      start: previousUpper,
      end: absoluteUpper,
      rate: Number(item?.rate ?? 0)
    }

    if (index === sourceBrackets.length - 1) {
      current.end = null
    }

    previousUpper = absoluteUpper == null ? previousUpper : absoluteUpper
    return current
  })
}

const normalizeTaxBrackets = (sourceBrackets = [], threshold = 5000) => {
  const hasLegacyUpperLimit = sourceBrackets.some((item) => Object.prototype.hasOwnProperty.call(item || {}, 'upperLimit'))
  const initialBrackets = hasLegacyUpperLimit
    ? convertLegacyUpperLimitBrackets(sourceBrackets, threshold)
    : sourceBrackets.map((item) => ({
      start: normalizeRangeValue(item?.start),
      end: normalizeRangeValue(item?.end, true),
      rate: Number(item?.rate ?? 0)
    }))

  const sorted = [...initialBrackets].sort((a, b) => a.start - b.start)

  return sorted.map((item, index) => {
    const start = index === 0
      ? threshold
      : normalizeRangeValue(sorted[index - 1].end)

    const isLast = index === sorted.length - 1
    let end = isLast ? null : normalizeRangeValue(item.end)
    if (!isLast && end <= start) {
      end = start + 1000
    }

    return {
      start,
      end,
      rate: Number(item.rate ?? 0)
    }
  })
}

export const useSalaryStore = defineStore('salary', {
  state: () => ({
    // 实发工资
    realPay: '10,216.79',

    // 工资明细列表（顺序与页面一致）
    items: [
      { label: '姓名', value: '同员1032', type: 'income' },
      { label: '任职部门', value: '市场推广部', type: 'income' },
      { label: '职务', value: '推广组长', type: 'income' },
      { label: '专项薪酬标准', value: '8500', type: 'income' },
      { label: '应出勤天数', value: '20', type: 'income' },
      { label: '事假', value: '0', type: 'income' },
      { label: '病假', value: '0', type: 'income' },
      { label: '实出勤天数', value: '20', type: 'income' },
      { label: '补贴', value: '500', type: 'income' },
      { label: '绩效', value: '2000', type: 'income' },
      { label: '应发合计', value: '11000', type: 'income' },
      { label: '个人社保代扣', value: '398.07', type: 'deduction' },
      { label: '个人公积金代扣', value: '118', type: 'deduction' },
      { label: '个人所得税代扣', value: '267.14', type: 'deduction' },
      { label: '应扣合计', value: '783.21', type: 'deduction' }
    ],

    insuranceConfig: createDefaultInsuranceConfig(),
    taxConfig: createDefaultTaxConfig()
  }),

  actions: {
    // 从接口加载工资条（后期接后端用）
    setSalaryData(data) {
      this.realPay = data.realPay
      this.items = data.items
    },

    applyInsuranceConfig(config = {}) {
      const defaults = createDefaultInsuranceConfig()

      Object.keys(defaults).forEach((key) => {
        const currentItem = config[key] || {}

        this.insuranceConfig[key] = {
          personal: Number(currentItem.personal ?? defaults[key].personal),
          company: Number(currentItem.company ?? defaults[key].company)
        }
      })
    },

    applyTaxConfig(config = {}) {
      const defaults = createDefaultTaxConfig()
      const sourceBrackets = Array.isArray(config.brackets) && config.brackets.length
        ? config.brackets
        : defaults.brackets

      const threshold = Number(config.threshold ?? defaults.threshold)
      this.taxConfig = {
        threshold,
        brackets: normalizeTaxBrackets(sourceBrackets, threshold)
      }
    },

    loadInsuranceConfig() {
      const savedConfig = localStorage.getItem(SALARY_CONFIG_STORAGE_KEY)

      if (!savedConfig) {
        const legacyInsuranceConfig = localStorage.getItem(INSURANCE_CONFIG_STORAGE_KEY)
        if (legacyInsuranceConfig) {
          try {
            this.applyInsuranceConfig(JSON.parse(legacyInsuranceConfig))
          } catch {
            this.applyInsuranceConfig()
          }
          this.applyTaxConfig()
          return
        }

        this.applyInsuranceConfig()
        this.applyTaxConfig()
        return
      }

      try {
        const parsed = JSON.parse(savedConfig)
        this.applyInsuranceConfig(parsed.insuranceConfig)
        this.applyTaxConfig(parsed.taxConfig)
      } catch {
        this.applyInsuranceConfig()
        this.applyTaxConfig()
      }
    },

    updateInsuranceConfig(config) {
      this.applyInsuranceConfig(config)
    },

    saveInsuranceConfig(config, taxConfig) {
      if (config) {
        this.applyInsuranceConfig(config)
      }

      if (taxConfig) {
        this.applyTaxConfig(taxConfig)
      }

      localStorage.setItem(SALARY_CONFIG_STORAGE_KEY, JSON.stringify({
        insuranceConfig: this.insuranceConfig,
        taxConfig: this.taxConfig
      }))

      localStorage.setItem(INSURANCE_CONFIG_STORAGE_KEY, JSON.stringify(this.insuranceConfig))
    }
  }
})
