const userSchema = new Schema(
  {
    firstName:         { type: String, required: true, trim: true },
    lastName:          { type: String, required: true, trim: true },
    email:             { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:          { type: String, required: true, minlength: 8 },
    phone:             { type: String, default: '' },
    location:          { type: String, default: '', enum: ['', 'Gaza City', 'Khan Younis', 'Rafah', 'Deir al-Balah', 'Jabalia', 'Beit Hanoun', 'Beit Lahia', 'Nuseirat', 'Other'] },
    authProvider:      { type: String, default: 'local' },
    avatar:            { type: String, default: '👤' },
    points:            { type: Number, default: 50 },
    rating:            { type: Number, default: 0 },
    completedServices: { type: Number, default: 0 },
    bio:               { type: String, default: '' },
  },
  { timestamps: true }
);