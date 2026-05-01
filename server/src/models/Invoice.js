import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  dueDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'overdue'],
    default: 'pending'
  },
  currency: {
    type: String,
    default: 'MXN'
  },
  client: {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    company: String,
    address: String,
    city: String,
    zipCode: String,
    country: String
  },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
  }],
  taxRate: {
    type: Number,
    default: 16
  },
  notes: String,
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
})

// Auto-update overdue status before saving
invoiceSchema.pre('save', function(next) {
  const today = new Date()
  const dueDate = new Date(this.dueDate)

  if (this.status === 'pending' && dueDate < today) {
    this.status = 'overdue'
  }

  next()
})

export default mongoose.model('Invoice', invoiceSchema)
