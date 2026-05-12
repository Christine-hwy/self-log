# Journey - 个人旅游足迹网站

一个极简高级的个人旅游记录网站，采用 3D 地球交互界面，让你优雅地记录和展示你的旅行足迹。

## ✨ 特性

- 🌍 **交互式 3D 地球** - 使用 globe.gl 呈现真实地球，支持旋转、缩放和平滑动画
- 📍 **点击添加足迹** - 直接在地球上点击任意位置创建新的旅行记忆
- 📸 **照片视频上传** - 支持上传多张照片和视频，记录每个地方的精彩瞬间
- 🗺️ **世界地图标签** - 放大地球时显示全球100+个国家和城市名称（中国、美国、日本、香港、广州等）
- 🔍 **智能标签系统** - 国家显示蓝色，城市显示白色，你的旅行地点显示紫色
- 🎨 **极简高级设计** - 深色主题，柔和渐变，Apple 级别的交互体验
- 📊 **数据统计** - 实时显示旅行地点、照片、视频数量
- 🖼️ **媒体画廊** - 点击记忆查看完整照片和视频，支持全屏浏览
- 💾 **本地数据管理** - 所有数据存储在 `src/data/site.ts`，无需后端
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🛠️ 技术栈

- **React 18** - 现代化的 UI 框架
- **TypeScript** - 类型安全的开发体验
- **Tailwind CSS v4** - 实用优先的 CSS 框架
- **Globe.gl** - 强大的 3D 地球可视化库
- **Three.js** - 3D 图形渲染引擎
- **Lucide React** - 精美的图标库
- **Motion** - 流畅的动画库

## 📁 项目结构

```
src/
├── app/
│   ├── App.tsx                    # 主应用组件
│   └── components/
│       ├── Globe3D.tsx            # 3D 地球组件（支持地址标签）
│       ├── AddMemoryDialog.tsx    # 添加记忆对话框
│       ├── MediaUpload.tsx        # 照片视频上传组件
│       ├── MemoryDetail.tsx       # 记忆详情弹窗
│       ├── MemoryList.tsx         # 记忆列表
│       ├── StatsCard.tsx          # 统计卡片
│       ├── LoadingScreen.tsx      # 加载屏幕
│       ├── HelpButton.tsx         # 帮助按钮
│       └── QuickTip.tsx           # 快捷提示
├── data/
│   └── site.ts                    # 网站数据和配置
└── styles/
    ├── theme.css                  # 主题样式
    └── fonts.css                  # 字体配置
```

## 🚀 如何使用

### 添加新的旅行记忆

1. **方式一：点击地球** - 直接在 3D 地球上点击任意位置（如广州）
2. **方式二：使用按钮** - 点击左侧面板底部的 "Add New Memory" 按钮

### 填写记忆信息

- **Location Name** - 地点名称（如：广州，广东，中国）
- **Latitude & Longitude** - 经纬度坐标（点击地球会自动填充）
- **Date** - 旅行日期
- **Description** - 旅行描述和回忆
- **Photos** - 上传照片（支持多张，JPG/PNG/GIF/WebP）
- **Videos** - 上传视频（支持多个，MP4/WebM/MOV）

### 查看记忆

**地球交互**：
- 悬停在地球上的标记点查看简要信息和媒体数量
- 点击标记点打开详情弹窗，查看所有照片和视频
- 放大地球（滚轮缩放）会显示地址标签

**详情弹窗**：
- 点击照片可以全屏查看
- 视频支持在线播放
- 显示完整的旅行描述和坐标

**侧边栏列表**：
- 显示所有记忆列表
- 显示每个地点的照片和视频数量
- 点击列表项查看详情

## 🎨 设计理念

- **极简主义** - 去除多余元素，专注核心功能
- **高级感** - 深色背景、柔和渐变、精致动画
- **流畅交互** - Apple Keynote 级别的交互体验
- **视觉层次** - 清晰的信息层级和视觉引导

## 📝 自定义数据

编辑 `src/data/site.ts` 文件来自定义你的数据：

```typescript
export interface MediaFile {
  url: string;      // 图片/视频的 URL 或 Base64
  name: string;     // 文件名
  type: 'image' | 'video';
}

export const siteData = {
  title: "My Travel Journey",
  subtitle: "Exploring the world, one destination at a time",
  
  memories: [
    {
      id: "1",
      location: "广州，广东，中国",
      lat: 23.1291,
      lng: 113.2644,
      date: "2024-06",
      photos: [
        {
          url: "图片URL或Base64",
          name: "广州塔.jpg",
          type: "image"
        }
      ],
      videos: [
        {
          url: "视频URL或Base64",
          name: "珠江夜景.mp4",
          type: "video"
        }
      ],
      description: "美丽的花城，珠江夜景让人陶醉..."
    }
  ]
};
```

## 🎯 未来功能（可扩展）

- ✅ ~~照片和视频上传功能~~ （已完成）
- ✅ ~~智能地址标签显示~~ （已完成）
- 🗺️ 旅行路线连线动画
- 📅 时间轴视图
- 🔍 搜索和筛选功能
- 📤 导出和分享功能
- 🌐 多语言支持
- ☁️ 云端存储同步

## 💡 使用提示

- **旋转**：鼠标拖拽旋转地球
- **缩放**：滚动鼠标滚轮缩放视图
- **世界地图**：放大地球查看全球国家和城市标签
  - 🔵 **蓝色** = 国家名称 (China, USA, France...)
  - ⚪ **白色** = 城市名称 (Beijing, New York, London...)
  - 🟣 **紫色** = 你的旅行地点 (Hong Kong, Guangzhou...)
- **悬停预览**：鼠标悬停在标记点查看照片缩略图
- **查看详情**：点击标记点查看完整照片和视频
- **上传媒体**：添加记忆时可以上传多张照片和视频
- **全屏查看**：在详情页点击照片可以全屏浏览
- **自动旋转**：地球会自动缓慢旋转，增加动态感
- **帮助指南**：点击帮助按钮（右下角）查看详细使用指南

## 🌟 视觉参考

- [NASA Earth](https://science.nasa.gov/earth/facts/)
- [Earth Nullschool](https://earth.nullschool.net/)
- Apple Keynote 设计风格

---

**Enjoy your journey! 🌍✈️**
