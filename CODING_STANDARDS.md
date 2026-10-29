# Coding Standards

กติกาการเขียนโค้ดของโปรเจคนี้ ใช้ทั้งตอนเขียนและตอน review ไม่ว่าคนหรือ AI เป็นคนเขียน
โค้ดทุกไฟล์ในตอนนี้ทำตามกติกาพวกนี้แล้ว ถ้าเจอที่ไม่ตรงถือว่าเป็นบั๊กของโค้ด ไม่ใช่ข้อยกเว้น

## หลักคิด

1. **เรียบง่าย** อ่านไฟล์เดียวแล้วเข้าใจได้เลย ไม่ต้องกระโดดไปดูไฟล์อื่นเพื่อรู้ว่า element นี้หน้าตาเป็นยังไง
2. **Pragmatic TypeScript** ใช้ type เท่าที่ช่วยจับบั๊กได้จริง ไม่ทำ type ซับซ้อนเพื่อความเท่
3. **ขยายได้** ของใหม่เพิ่มด้วยการเพิ่มไฟล์ตามกติกาเดิม ไม่ใช่สร้าง abstraction ใหม่ไว้รอ
   เช่น โจทย์ใหม่คือไฟล์ JSON หนึ่งไฟล์ สูตรใหม่คือไฟล์ใน `content/methods/` แล้ว TypeScript จะบังคับให้เติม `MethodIcon` ให้ครบเอง
4. **ไม่ทำ workaround** ถ้าอะไรไม่พอดี ให้แก้ที่ต้นเหตุ

## โครงสร้างและขอบเขต

| โฟลเดอร์ | มีอะไร | ห้าม |
| --- | --- | --- |
| `src/cube/` | โดเมนล้วน: เรขาคณิต การพับ การเทียบภาพ schema ของโจทย์ | React, three.js, DOM |
| `src/lesson/` | โดเมนของบทเรียน: scene, method | React, three.js, DOM |
| `src/content/` | ข้อมูลโจทย์และบทเรียน + ตัวโหลดที่ตรวจทุกไฟล์ | React |
| `src/progress/`, `src/theme/` | สถานะในเบราว์เซอร์ (localStorage, cookie) + hook ที่อ่านมัน | คอมโพเนนต์ |
| `src/components/<หมวด>/` | UI แบ่งตามหมวด: `layout` `dashboard` `quiz` `learn` `lab` `cube` (SVG) `cube-3d` (three.js) `ui` (กลาง) | |
| `src/routes/` | `Route` กับคอมโพเนนต์ของหน้านั้น | ชิ้นส่วนอื่นของหน้า |

- import ไปทางเดียว: `routes → components → progress / theme → content → lesson → cube` ห้ามย้อนกลับ
- คอมโพเนนต์ใช้ของข้ามหมวดได้ (เช่น `dashboard` ใช้ `quiz/DifficultyBadge`)
  แต่ `components/cube-3d/` ข้างนอกใช้ได้แค่ `LazyFoldStage` / `LazyLessonStage` เพื่อให้ three.js อยู่ใน chunk ที่โหลดทีหลังเสมอ
- logic ที่ไม่ต้องใช้ React ให้เป็นฟังก์ชันธรรมดาในโดเมน แล้วเขียนเทสให้ ไม่ฝังไว้ในคอมโพเนนต์
- ไฟล์ route มีแค่ `Route` (loader, head, validateSearch) กับคอมโพเนนต์ของหน้า ใน `__root` มี shell กับหน้า 404 เพิ่ม

## ไฟล์และการตั้งชื่อ

- คอมโพเนนต์ตั้งชื่อ `PascalCase.tsx` และ export คอมโพเนนต์เดียวที่ชื่อตรงกับไฟล์
  คอมโพเนนต์ย่อยที่ใช้แค่ในไฟล์นั้นเขียนไว้ข้างล่างได้โดยไม่ต้อง export
- ไฟล์อื่นเป็น `kebab-case.ts` ไฟล์ที่มีแค่ hook ตั้งชื่อ `use-*.ts` (เช่น `use-figure-state.ts`)
- เทสวางไว้ข้างไฟล์ที่เทส: `geometry.ts` คู่กับ `geometry.test.ts`
- ใน `src/` ใช้ named export ทั้งหมด ยกเว้นไฟล์ที่โหลดผ่าน `React.lazy` ซึ่งต้องเป็น `export default` (`FoldStage`, `LessonStage`)
- export เฉพาะสิ่งที่ไฟล์อื่นใช้ ส่วน type ที่อยู่ใน signature ของสิ่งที่ export ไปแล้ว export ได้

## Styling

- เขียน class ของ Tailwind ตรง ๆ ที่ `className` ซ้ำกันหลายที่ได้
  **ไม่ทำไฟล์หรือค่าคงที่ไว้แชร์ string ของ class** (แบบ `buttonStyles.primary`) และไม่ใช้ `clsx` / `cva` / `tailwind-merge`
- ถ้าซ้ำกันทั้งหน้าตาและพฤติกรรม ให้ทำเป็นคอมโพเนนต์ไปเลย (อย่าง `Widget`, `Skeleton`, `MethodIcon`)
- ตารางที่เลือก class ตามค่าที่มี type ใช้ได้ แต่ให้อยู่ในไฟล์ของคอมโพเนนต์ที่ใช้เท่านั้น

  ```tsx
  const BADGE_STYLES: Record<ChoiceState, string> = {
    idle: 'bg-fill text-ink-soft',
    selected: 'bg-brand-600 text-white',
    // …
  }
  ```

- สีพื้นฐานใช้ token ตามบทบาทที่ประกาศใน `src/styles.css` (`bg-canvas`, `bg-surface`, `text-ink`, `text-ink-muted`, `border-line` …)
  ไม่ใช้ `stone-*` / `white` ตรง ๆ เพราะ token พวกนี้สลับค่าเองในโหมดมืด
- สีแบรนด์ใช้ `brand-*` ส่วนสีสถานะเขียน `emerald` (ถูก/ง่าย) / `amber` (เตือน/ปานกลาง) / `rose` (ผิด/ยาก) ตรง ๆ คู่กับ `dark:` เสมอ
- ไม่ต้องเรียง class เอง `pnpm format` (oxfmt) เรียงให้ตามแบบของ Tailwind

## TypeScript

- props ตัวเดียวเขียน type inline ได้ ตั้งแต่ 2 ตัวขึ้นไปใช้ `interface XxxProps` วางไว้เหนือคอมโพเนนต์

  ```tsx
  export function StatusBadge({ status }: { status: QuestionStatus }) {}

  interface ChoiceCardProps {
    label: string
    view: CubeView
  }
  export function ChoiceCard({ label, view }: ChoiceCardProps) {}
  ```

- `import type { ReactNode } from 'react'` ไม่ใช้ `React.ReactNode`
- ตาราง lookup เขียนเป็น `const X: Record<Union, T> = {…}` ให้ TypeScript เช็กว่าครบทุกค่า
  ใช้ `as const` เฉพาะตอนต้องใช้ค่าตัวอักษรต่อ (เช่น `NAV_ITEMS` ที่ `Link` ต้องรู้ `to` แต่ละตัว หรือ `keyof typeof` ของตาราง)
- ดึง type จากต้นทาง ไม่ประกาศซ้ำ: `z.output<typeof schema>`, `(typeof DIFFICULTIES)[number]`, `ReturnType<typeof useFigureState>`
- โค้ดแอปไม่ใช้ `any`, `as` (ยกเว้น `as const`) และ `!` ถ้า type ไม่พอให้แก้ type ที่ต้นทาง
  ในเทสใช้ `!` กับ lookup ที่รู้ว่ามีแน่ ๆ ได้
- index array ที่อาจเลยขอบ ให้เช็กเองหรือใช้ `.at()` ซึ่งคืน `T | undefined`

## React

- คอมโพเนนต์รับข้อมูล ไม่รับ JSX ที่ประกอบมาแล้วหรือ render function
  ยกเว้น `children` กับ slot ที่ตั้งชื่อชัด ๆ (อย่าง `nav` ของ `StepView` หรือ `media` / `action` ของ `FeatureCard`)
- ถ้าผู้เรียกทุกที่ส่งค่าเดียวกันมา ให้คอมโพเนนต์จัดการเอง (เช่น `QuestionPlayer` บันทึกคำตอบเอง)
- reset state ด้วย `key` ยกเว้นตรงที่จะทำให้ canvas 3D mount ใหม่ (ดู `useSceneTimeline`)
- `useMemo` / `useCallback` ใช้เฉพาะตอนที่ identity สำคัญ (deps ของ effect, three.js) หรือเป็นงานหนักจริง ๆ
- สถานะในเบราว์เซอร์อ่านผ่าน `useSyncExternalStore` ที่คืน `null` ก่อน hydrate แล้วหน้าแสดง `Skeleton` ไปก่อน
  ไม่ใช้ state library
- loader คืนแค่ค่าเล็ก ๆ อย่าง index เพราะ loader data ถูกส่งไปกับหน้าเว็บ แล้วให้หน้าไปหยิบข้อมูลเอง

## ข้อมูลและการตรวจ

- ข้อมูลที่มาจากข้างนอก (ไฟล์โจทย์, localStorage, cookie, search params) ตรวจด้วย Zod ก่อนใช้
- เนื้อหาโจทย์และบทเรียนถูกตรวจกับกล่องที่พับจริงตอนโหลด ถ้าตรวจไม่ผ่านให้ throw แล้วให้ `pnpm test` พัง ไม่ปล่อยผ่านเงียบ ๆ

## Comment และภาษา

- ชื่อใน code และ comment เป็นภาษาอังกฤษ ข้อความที่ผู้ใช้เห็นเป็นภาษาไทย รวมถึงข้อความแจ้งปัญหาในหน้าสร้างโจทย์
- comment อธิบาย *ทำไม* ไม่ใช่ *ทำอะไร* โดยเฉพาะจุดที่ดูแปลกแต่ตั้งใจ
- คอมโพเนนต์และฟังก์ชันที่ export มี JSDoc สั้น ๆ บอกหน้าที่ เมื่อชื่ออย่างเดียวยังไม่พอ

## เทส

- เทสด้วย Vitest เฉพาะ logic (`*.test.ts`) ไม่มีเทสคอมโพเนนต์ ส่วน UI ให้เปิดดูในเบราว์เซอร์จริง
- เพิ่ม logic ในโดเมนต้องมีเทสคู่กัน
- ก่อน commit ต้องผ่าน `pnpm format && pnpm typecheck && pnpm lint && pnpm test && pnpm build`

## Import

- ใช้ `#/…` เวลาข้ามโฟลเดอร์ และ `./…` ในโฟลเดอร์เดียวกัน ไม่ใช้ `../`
- เรียงเป็นกลุ่ม: package → `#/` ที่ไม่ใช่ components → `#/components` → `./`

  ```ts
  import { Link } from '@tanstack/react-router'
  import { useState } from 'react'
  import { questions } from '#/content/questions'
  import { NetDiagram } from '#/components/cube/NetDiagram'
  import { Widget } from './Widget'
  ```

## Git

- ข้อความ commit ขึ้นต้นด้วย `feat:` `fix:` `refactor:` `docs:` `style:` `chore:` ตามด้วยประโยคภาษาอังกฤษตัวเล็ก
  ส่วน body (ถ้ามี) อธิบายว่าทำไม
- หนึ่ง commit หนึ่งเรื่อง ให้ review ทีละเรื่องได้ และ commit ที่เป็น `refactor:` ต้องไม่เปลี่ยนพฤติกรรม
