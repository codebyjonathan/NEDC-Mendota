"use client"

type Props = {
  lang?: "en" | "es" | "ar" | string
}

export function MedicalDisclaimerCard({ lang = "en" }: Props) {
  const isSpanish = lang === "es"

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 shadow-sm">
      <h3 className="mb-2 text-base font-bold text-amber-900">
        {isSpanish ? "Aviso importante de salud" : "Important Health Disclaimer"}
      </h3>
      <ul className="space-y-2 text-sm text-amber-900">
        <li>
          {isSpanish
            ? "Safe Space no es un dispositivo medico y no diagnostica, trata, cura ni previene ninguna condicion."
            : "Safe Space is not a medical device and does not diagnose, treat, cure, or prevent any condition."}
        </li>
        <li>
          {isSpanish
            ? "El contenido de Safe AI es solo apoyo informativo y puede ser incompleto."
            : "Content from Safe AI is informational support only and may be incomplete."}
        </li>
        <li>
          {isSpanish
            ? "Para consejo medico, diagnostico o tratamiento, consulta siempre a un profesional de salud con licencia."
            : "For medical advice, diagnosis, or treatment, always consult a licensed healthcare professional."}
        </li>
        <li className="font-semibold">
          {isSpanish
            ? "Si hay peligro inmediato, llama al 911 ahora. Para apoyo en crisis en EE.UU., llama o envia mensaje al 988."
            : "If there is immediate danger, call 911 now. For U.S. crisis support, call or text 988."}
        </li>
      </ul>
    </div>
  )
}

