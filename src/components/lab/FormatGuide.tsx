/** A summary of the question file format, beside the editor. */
export function FormatGuide() {
  return (
    <details className="mt-10 rounded-3xl border border-line bg-surface p-5 sm:p-6" open>
      <summary className="cursor-pointer text-lg font-semibold">คู่มือรูปแบบโจทย์</summary>
      <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm leading-relaxed text-ink-soft md:grid-cols-[10rem_1fr]">
        <dt className="font-mono font-semibold text-ink">layout</dt>
        <dd>
          วาดแผ่นคลี่เป็นแถวตัวอักษร 1 ตัวต่อ 1 หน้า (A–Z หรือตัวเลข) และใช้ <code>.</code> แทนช่องว่าง ต้องมี 6
          หน้าที่พับเป็นลูกบาศก์ได้จริง เช่น <code>["A...", "BCDE", ".F.."]</code>
        </dd>
        <dt className="font-mono font-semibold text-ink">faces</dt>
        <dd>
          ลวดลายของแต่ละหน้า วาดในกรอบ 100×100 โดยมุมซ้ายบนคือ (0, 0) และมองจากด้านนอกกล่อง
          หน้าที่ไม่ได้ใส่จะเป็นหน้าว่าง รูปที่ใช้ได้: <code>{'{ "type": "rect", "x", "y", "w", "h" }'}</code>,{' '}
          <code>{'{ "type": "circle", "cx", "cy", "r" }'}</code>,{' '}
          <code>{'{ "type": "polygon", "points": [[x, y], …] }'}</code>,{' '}
          <code>{'{ "type": "line", "from": [x, y], "to": [x, y] }'}</code> ใส่ <code>"fill"</code>{' '}
          เป็น <code>"black"</code> (ค่าเริ่มต้น), <code>"gray"</code> หรือ <code>"none"</code>{' '}
          (เส้นขอบอย่างเดียว)
        </dd>
        <dt className="font-mono font-semibold text-ink">choices</dt>
        <dd>
          ตัวเลือก 2–5 ข้อ แต่ละข้อบอกหน้าที่เห็นด้าน <code>top</code>, <code>left</code>, <code>right</code>{' '}
          เขียนเป็น <code>"A"</code> หรือ <code>{'{ "face": "A", "rotate": 90 }'}</code>{' '}
          (หมุนตามเข็มนาฬิกา) ถ้าไม่หมุน ลายด้านซ้ายและขวาจะตั้งตรง ส่วนด้านบนจะวางเหมือนพับขึ้นมาจากหน้าด้านซ้าย
          สลับไปดู 3D เพื่อเช็กว่าหน้าตาตรงกับที่ตั้งใจไว้
        </dd>
        <dt className="font-mono font-semibold text-ink">ask</dt>
        <dd>
          <code>"possible"</code> (ค่าเริ่มต้น) ถามหารูปที่พับได้ หรือ <code>"impossible"</code>{' '}
          ถามหารูปที่พับไม่ได้ ระบบหาคำตอบเองจากการพับจริง จึงต้องมีคำตอบที่ถูกเพียงข้อเดียว
        </dd>
        <dt className="font-mono font-semibold text-ink">อื่น ๆ</dt>
        <dd>
          <code>title</code> ชื่อโจทย์, <code>difficulty</code> เป็น <code>"easy"</code>,{' '}
          <code>"medium"</code> หรือ <code>"hard"</code>, <code>explanation</code>{' '}
          คำอธิบายหลังตรวจคำตอบ (ไม่ใส่ก็ได้) และ <code>prompt</code> ถ้าต้องการเปลี่ยนคำถาม
        </dd>
      </dl>
    </details>
  )
}
