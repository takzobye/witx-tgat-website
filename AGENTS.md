# AGENTS.md

คำแนะนำสำหรับ AI coding agent ที่ทำงานในโปรเจคนี้

- กติกาการเขียนโค้ดทั้งหมดอยู่ใน [CODING_STANDARDS.md](CODING_STANDARDS.md) อ่านก่อนแก้โค้ดทุกครั้ง และต้องทำตามทุกข้อ
- ภาพรวม วิธีเพิ่มโจทย์ และวิธีเขียนบทเรียนอยู่ใน [README.md](README.md)

## โปรเจคนี้คืออะไร

เว็บฝึกโจทย์ "พับกล่อง" (แผ่นคลี่ลูกบาศก์) ของ TGAT2 ทำด้วย TanStack Start + Router, React 19, Tailwind CSS 4,
three.js ผ่าน React Three Fiber และ Zod ไม่มี backend หรือฐานข้อมูล ความคืบหน้าของผู้เรียนเก็บใน `localStorage` เท่านั้น

## คำสั่ง

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # Vitest
pnpm typecheck    # tsrs
pnpm lint         # oxlint
pnpm format       # oxfmt (เรียง class ของ Tailwind ให้ด้วย)
pnpm build
```

- ก่อนบอกว่าเสร็จหรือก่อน commit ต้องผ่าน `pnpm format && pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- เจ้าของโปรเจคมักเปิด dev server ที่ port 3000 ไว้แล้ว ถ้า port ถูกใช้อยู่และเป็นโปรเจคนี้ ให้ใช้ตัวนั้น ไม่ต้องเปิดซ้ำ

## วิธีทำงาน

- มีคน review โค้ดทุกบรรทัด เขียนให้เรียบง่าย อ่านแล้วเข้าใจทันที ไม่ทำ workaround และไม่เพิ่ม abstraction ที่ยังไม่มีที่ใช้
- งานใหญ่หรือ refactor ให้วางแผนละเอียดก่อน รอให้เจ้าของยืนยัน แล้วค่อยลงมือ
- แบ่ง commit ทีละเรื่องให้ review ง่าย ตามรูปแบบใน CODING_STANDARDS.md
- อย่าเพิ่ม dependency ถ้ายังไม่ได้ถาม โดยเฉพาะ UI library, `clsx` / `cva` / `tailwind-merge` และ state library
- ถ้าแก้อะไรที่เห็นในเบราว์เซอร์ ให้เปิดดูของจริงทั้งโหมดสว่าง โหมดมืด และจอมือถือ
- ข้อความ UI เป็นภาษาไทย ส่วนชื่อใน code, comment และ commit message เป็นภาษาอังกฤษ

## จุดที่พลาดง่าย

- `src/routeTree.gen.ts` สร้างอัตโนมัติจากไฟล์ใน `src/routes/` ห้ามแก้เอง
- ไฟล์ใน `src/components/cube-3d/` (three.js) ห้ามเอาไปใช้จากข้างนอก ยกเว้น `LazyFoldStage` / `LazyLessonStage`
  และ `vite.config.ts` ปิด source injection ของ devtools ให้โฟลเดอร์นี้ เพราะ React Three Fiber อ่าน prop ที่มีขีดกลางเป็น path
  ถ้าย้ายหรือเปลี่ยนชื่อโฟลเดอร์ต้องแก้ regex ตรงนั้นด้วย
- โจทย์ใน `src/content/questions/*.json` ห้ามใส่คำตอบเอง ระบบพับแผ่นคลี่แล้วหาคำตอบให้ และต้องได้คำตอบเดียวพอดี
  เพิ่มหรือแก้โจทย์แล้วให้รัน `pnpm test` (หรือร่างในหน้า `/lab` ก่อน)
- เนื้อหาบทเรียนใน `src/content/methods/` ถูกตรวจกับกล่องที่พับจริงตอนโหลด ถ้าเทสพัง ให้แก้เนื้อหา อย่าไปปิดการตรวจ
- `localStorage` และเวลาปัจจุบันไม่มีฝั่ง server hook พวกนี้จึงคืน `null` ก่อน hydrate แล้วหน้าแสดง skeleton ไปก่อน
  อย่าอ่านค่าเหล่านี้ตรง ๆ ตอน render เพราะ markup ของ server กับ browser จะไม่ตรงกัน
- loader data ถูก serialize ส่งไปกับหน้าเว็บ ให้ loader คืน index ไม่ใช่ object โจทย์หรือบทเรียนทั้งก้อน
- `useSceneTimeline` reset state เองเมื่อ scene เปลี่ยน อย่าเปลี่ยนไปใช้ `key` เพราะจะทำให้ canvas 3D mount ใหม่ทุกขั้น
- `vitest.config.ts` ปิด `fsModuleCache` ไว้ ไม่งั้นโจทย์ที่เพิ่มใหม่จะไม่ถูกตรวจ อย่าเปิดคืน
