# 📸 Image Upload Feature - Database Storage

## Overview

The Immigrant Voices platform now supports **direct image uploads** stored in the PostgreSQL database instead of using external services like Cloudinary. Images are stored as binary data (BYTEA) in the database.

---

## 🚀 Setup Instructions

### 1. Run the Database Migration

Before using the image upload feature, you need to add the necessary database columns:

```bash
.\run-image-migration.bat
```

This will:
- Add `avatar_data` and `avatar_mime_type` columns to the `users` table
- Add `featured_image_data` and `featured_image_mime_type` columns to the `stories` table
- Create a new `images` table for general image storage

---

## 📋 Features

### ✅ What's Included

1. **User Avatar Upload**
   - Upload profile pictures
   - Stored directly in database
   - Max size: 2MB
   - Supported formats: JPEG, PNG, GIF, WebP

2. **Story Featured Images**
   - Upload cover images for stories
   - Stored directly in database
   - Max size: 5MB
   - Supported formats: JPEG, PNG, GIF, WebP

3. **General Image Upload**
   - Upload any image for future use
   - Stored in dedicated `images` table
   - Max size: 5MB
   - Supported formats: JPEG, PNG, GIF, WebP

---

## 🔌 API Endpoints

### Upload Endpoints

#### 1. Upload User Avatar
```
POST /api/users/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: { avatar: <file> }
```

#### 2. Upload Story Featured Image
```
POST /api/stories/:id/image
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: { image: <file> }
```

#### 3. Upload General Image
```
POST /api/images/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: { image: <file> }
```

### Retrieval Endpoints

#### 1. Get User Avatar
```
GET /api/images/avatar/:userId
```

#### 2. Get Story Featured Image
```
GET /api/images/story/:storyId
```

#### 3. Get General Image
```
GET /api/images/:id
```

### Delete Endpoint

#### Delete Image
```
DELETE /api/images/:id
Authorization: Bearer <token>
```

---

## 💻 Frontend Usage

### Using the ImageUpload Component

```tsx
import ImageUpload from '../components/ImageUpload';

function MyComponent() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <ImageUpload
      label="Upload Image"
      onImageSelect={(file) => setImageFile(file)}
      onImageRemove={() => setImageFile(null)}
      maxSize={5} // in MB
    />
  );
}
```

### Uploading to Server

```tsx
const formData = new FormData();
formData.append('image', imageFile);

await axios.post('/api/stories/:id/image', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

---

## 🗄️ Database Schema

### Users Table
```sql
avatar_data BYTEA              -- Binary image data
avatar_mime_type VARCHAR(50)   -- e.g., 'image/jpeg'
```

### Stories Table
```sql
featured_image_data BYTEA              -- Binary image data
featured_image_mime_type VARCHAR(50)   -- e.g., 'image/png'
```

### Images Table
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
filename VARCHAR(255)
original_filename VARCHAR(255)
mime_type VARCHAR(50)
size INTEGER
data BYTEA
created_at TIMESTAMP
```

---

## ⚙️ Configuration

### File Size Limits

- **Avatars**: 2MB
- **Story Images**: 5MB
- **General Images**: 5MB

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

---

## 🎯 Benefits of Database Storage

✅ **No External Dependencies** - No need for Cloudinary or S3  
✅ **Simplified Architecture** - Everything in one place  
✅ **Better Privacy** - Images never leave your server  
✅ **Cost Effective** - No third-party storage fees  
✅ **Atomic Operations** - Images deleted with parent records  

---

## 🔧 Troubleshooting

### Migration Fails
- Make sure PostgreSQL is running
- Check database connection in `.env`
- Verify you have write permissions

### Upload Fails
- Check file size (must be under limit)
- Verify file format is supported
- Ensure user is authenticated

### Image Not Displaying
- Check if image was uploaded successfully
- Verify the image URL is correct
- Check browser console for errors

---

## 📝 Next Steps

1. ✅ Run the migration: `.\run-image-migration.bat`
2. ✅ Restart the server
3. ✅ Test avatar upload in profile settings
4. ✅ Test story image upload when creating stories
5. ✅ Upload real images instead of using dummy URLs!

---

**Enjoy uploading real images! 🎉**

