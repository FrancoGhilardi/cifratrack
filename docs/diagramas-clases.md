# Diagramas de clases (UML) — CifraTrack

> Diagramas de clases del dominio (entidades, value objects, servicios) y de la capa de
> aplicación (UseCases, contratos de repositorio). Actualizar en cada cambio de firma,
> invariante o clase nueva en `src/entities/**` o `src/features/**/usecases`.
> Última verificación contra código: 2026-08-28.

---

## 1) Capa de dominio (`src/entities/**`)

![Diagrama de clases del dominio](https://www.plantuml.com/plantuml/svg/lLV9SYD54BttLoGwjS2InomN0mCQooOSWSSEZsO8Gt18TwMbmjLLJMMrF9ebWe_W7pZn0noPF-5BYApMqYN9om31nR9oprUvwMiEw4DT6YWCCd5FkL9RxR8FmeHAWigWjXbVQrkXnn8kiRWUUrTRTU2Cyt0pqO5QVB72Wn2ylgm37HVEFjEl21wrH6uyLjzf5IRmyMUFiYngmCYZPIo2TXPUPm0VQGNxmC5hEvQlDPC_JadNsWgXestXIkgywT3BYYnJHvX11qE9k28klAwYXmNzAs5WwMeRO1ziNLwIXqv1Dk3KSJHKuQma6queJ9ngHH1LDH_fboJ4I-SCeHKY1mmrIsGLMQNjkFEcKw5MqPmhYjfxKgUh8A1pSN5nqJivwGs7KKRLTBeMe-YlqnQcJfmDaqrhqHIxsXTqJYAfxVYyDhIU0rT6I_Qj5tWcfCWiF64WDH218GQAJr6fTLgl9upNahaktaAZbIiCs4qj9s9NtfLdv5bp85lSAX_SS7IQhp66erFXtUWmYT7cCOqjsYNwwm6VeLPv0-8M6St7iOQYazPBQZviIcgJSTOyxHQ6U4gflIaQBPX5-jHfbRtTKlSnZwRuOp9IGWFlSVP5v3nUuZocC781JJJN56sJQIWcn8DOpdbJrMlX1TV6MvZHz0y_lk-xHBLxKakgxg5D_S_xzjwHe71sUhLebfNEdUrwP_SB55CwygvSM8sVAzR89On_tr6LTnKBqWcs6uytVB9yimt1LJUfuEvvmGCCD7P-zfzCP8jb-h2Q1n6bzGuQqXNM9gGjr7jGXIu2JXDTKESpuxsxlK3xX8PaA53QsakWpjfbyb2q_Wz0ai1IL1BM79hxCpssK-8WYWzDip8OhfmlxsdpcIQZphoRQfMOQDQVrxRG5PhMbbPKw1BD3ZmzbVQYMRFtBRPaAkVZClzfEG5uoPqly0DNLdBEREnm7-PRUj6brWNY9AwxrzuAghiQD9KQKpYqQhXeH_adnZb1FhIArZUBo0znnkTKehQBVRJAxwxcNZc-4EWFq1IrmU1yyx35_BiCdJduEn0ixe2Wk0ChvD8ieh5pujg4nCpeSD2sTAKjccPLDHRJNRPKErh9RGta5ZK1vSZv4VenDI5jQ8SLhsLa2Szp9h-rn0Lgar0co1DIPyXyu_mTFTxCVxdPR35RQuUINZdRweXb7B6qOo0zAMLkvxjb21o8J1ubkytUeTcMIS6Eyqh-RXTwHTxb2IkundAAjzmJOYgbIhTZo8qhqD0EB3Bk9YcZKhaB4_A96wulWySYR66LjGcwChFy2elWKfxICZPo-U0rbkPlOblwqGJjocmoOBybvblPz7EDXc_H_7u1rCQWR3R_wmJM2ZrJFaLJKxTzBMX-GbVEqorE1bU1_5PUSCyYe7atgPpsZwdENWTShmUTH_t-NcVptjo7U6nchS7Uxp--OphiGyq8EPEVwa8xK0JptupTB3tvnFM7udgl0uj3QErckasZ2JPLcbzJMIQ3693XwLu6oGz7Qg-dPlHPq7QANgELuKqMo43XB0TVInLb08ncwe2lTVMY6PPYwKi8lYR8QqRbW5uMfcOzHJ5CK4MzjPMxsynrG0EUvXwq1qMi20p29J95h30uxlQp3EQjBM4PU74QcTgITr8d2A59hD3E4kzwQjf8iiWNFr2x_GnQAVUN8svNrY0xkrY4yrq95eEUElZhbrzbQrR8QEVPDB7aKn5sXVWR6-IUefwbiIkqwvSA_lpja_wdJUoBcsetFNsiWw39aeNMvf6hLJkOk5dqp3My-yFg0ZE0w4Oodtk1l7s2T46HeJ7AkotFeCy5pOLU1j1XRLEm0DaL6XLo1wPoJpNF_fpfG1uXdo2tgeOpWEcxtyLcvRexaW9PyK4sQ8Mgdv6Ln09bsTTaLLsQx6y0)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/clases-dominio.puml`](diagrams/clases-dominio.puml). El diagrama incluye las notas de esta sección embebidas.*

Notas:
- `Transaction`, `Investment` validan invariantes en el constructor salvo `skipValidation = true`
  (usado exclusivamente por `fromPersistence`/`fromDB` al reconstruir desde la base de datos).
- `Money` es el VO de dinero para transacciones/recurrentes (centavos). `Investment.principal`/`tna`
  son `number` decimal nativo — **no** pasan por `Money` (ver `docs/reglas-de-negocio.md` §3.4).
- `Category`/`PaymentMethod` no tienen `validate()` propio hoy — su única regla de negocio
  (`canBeDeleted`) delega en `isDefault`; la regla de "sin transacciones asociadas" vive en el
  UseCase (`hasTransactions` vía repo), no en la entidad.

---

## 2) Contratos de repositorio (`src/entities/*/repo.ts`)

![Diagrama de contratos de repositorio](https://www.plantuml.com/plantuml/svg/hPRFJzim5CVl_YkyMwTr5PgqopG91WMf1mPgcJWWXDpaDR5mxCX-eOID_tsoapHnQwSxx5AfVf_liz-ls6S6cSQg43GHp83vhA5KXgFIN1do0NCeW9Q2SKdCCvSbqwoWQvOyPrfLChrGGccwpJd2m6vTcH-8cgyhX4MYv8g_0JqP85lDodkUOaw_V3qXX4i4lM49qCMTPjAm1BcIo-uiDVrDAFqakC69qvkFz1kzPHcN324TI8pbDbocv_KYdV1qIYi3Uf5QVe3TSyn_iWBCgUKJ3GnXqf1JcZ9aCTxYLPbQl7T-N9A204zYuHV5KslC0C_hQoKntnsXiF_s73uyjl3bQmdIm0ePLcPL5GNJzQYoPUPtDwq7jvceerhVJjwz0YqXgRJcCbjM0e8bwaFqs2Q0I74ySgmg7dYa70ViQ1tioIuOGgOq1pFHbO06M9M2Ot_wdZclbmxgODDkghHpQ00F_4rfibiQRlu2cc_gMrON8F4QC5VfpLQ2DZalTpdWxZXhfGGmsQlwJK8IiwUn8Lo-SeDSPiDXQoFfX6r4WwvO0LhzkXBF5wusmxcxqggmBio48nH3cOlGRw65V063DjAH_fdImAZtoh59xwbX9_7TgiySQI8V7EsWH5LosFwoAjQWsw6xKyX4umpIGyZFK5lIUZG_6ouGj3crNZh1w91rqDXyTSoHh0onqPpap0pxP8_g-jAFtXk3Vqw1fnhDWqUE9SC3ZsJaWFtlQVbbGEzdeudmic1SJC3-Mha5J_VYzzRRSBkZs_K-kbjcp5Rf9cavCx4fdZEJhnNJ1nNA0ADNoqvqS2dD6HVrbL3Rw6Mu8vPg-_1eJ-DU6ZJ-P9Xh_lOcWFAY5EIznSSkiA0W-haAqf7H3R9ZZHuK15eWoCLguy6KpcQ4qa3kASjqLJ9QAarLOjC5wPEIKqBTnEd6uYhqPBjanpIrigM9FEI-_vdDmWKZqPU5qqIC97oPE4d8GaAVLaSVhfFeXyW98aQoFwSEzjT8S7WS630GSWOohGf1_W80)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/clases-repositorios.puml`](diagrams/clases-repositorios.puml).*

---

## 3) UseCases por feature

![Diagrama de UseCases por feature](https://www.plantuml.com/plantuml/svg/dLRDRXj73BxlKx0vsQaKfGLwCGmtYPq41f8qa6q41NgXPgXT8hCpco77jj86w4Fq1NhieQSyWj-aJrBCoYllwYTkUfEM_n-_8Vb45AEcse5nA2JZ96JoZ-8RhQWcQ1ooB-Gz-mOZrZ13yxwC8Nbx75o8S5MnKa-UtSXJrSYpf7HgWZ_ZZmIFUofN4PjtRBM2xtzuN1Ij1JnunQ8NGiSeT7X-z01GeFS9VYq03WzByXJPm0o5ZeuAW76a9i11gpgb9kHFumBWMxecavJsab0yjIEOirEAykC-7C3vb2GvBJvriL-IFbkSshNmmw_tPV22lStgNHQH9AHew1NEoC41Y4RsvKP-R4UmpB7DxBbNraK1yEXH0Q1L35S2RuA-o8W_Zp5440OVWAvPb5Obd90ZfV-Owb9vArp3T2u3s-9JrwABHYZgUKGlQ9I3xuThVGjhY0iuWDEUrdGbM4KpaR3N6ukARVLtHkzOgpTOasJrr5WSv7QloVWI7MUZiyQnoXxM8NaTWRH_UwNrqTkix5QSoTKJob3walh27cEsokKirJN6HQSpm7PA9iLCasboDFJIzModml85zCIRQGx4snBr557fTV1QkSLAUqlfTotFpHxutTBkzRTOvm2h9jnodItLJL3oIWVjQuq8aKg70Wk4bijeKTRfU8nAPLZXsIOsS-538WIoRFZciyzFXkM4vjX_zKj4lsJVDuC05KeVYfMZZFoj6zw2UXUX3_YWXBUugCdhQz8gsFzRnxrElgAOWQ_DWWRYdLMT-aiIpOhRYBnBciFVoJPZtycs17wQj2AlRB0TXN50rao-wM16NGo-R8v2toJDBCrw7KjhLYuHb6ls9Q0gclTWWizuLc1JNIzMK4wfp3CwhgV2FkE384HMm1AO9KDk_aQPp4EiiVtQO1bMleuhz2MzHP6h43S7pDiOvhm-4IxQiRackhCvGQbc0QDTcqWhXMVeq1iwenwjbrZQpdG8wCdcv_jdm23AoVbF7TAM79K8v22IS-J314sgaqCRW7mcTc9d1zQmDqz--LAQ575_XTvBqbTyIJypkJi-5yETUVZRUBnp4S01DC7c3W5TAtbByHU_LuN5yco29eQ64PeGkvarJveYodwnTaMqONQlZFx9qwhksZt5pcqy7X_jshzVC-5RDxic-wwNrXgjlQjTJ6frjr6cy44f7s1llYi0dZkmZ6N46g5E97alE0JsIhUznlWXiPBHcy-U3S9U3yJ94Fv90MkdKad-vg_89WZawnGQ5CbdLoghJA8mWakA8D5CfC98Tk9uDkcEvCb-PkfJhzI-M9HKSuGFYI1vw2AOu4qapIURSgPEJd_MZurj49wpmJneo056K_5bW7z-_mDSaDPbDYRVySiIU2g3uN1BFe6z9IKUZcvBV0YM2lZ2T1cjh_o7-q2YDtzw836HDGYOK8SboTl9PQaXRpblwH48UwWevZxWeuAyXTovedX2tgRQ5Vy2)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/clases-usecases.puml`](diagrams/clases-usecases.puml). Incluye la nota de intención arquitectónica de esta sección.*

Nota: el diagrama de UseCases muestra la intención arquitectónica (`ListUseCase`/`GetByIdUseCase`/
`DeleteUseCase` genéricos para passthrough puro, ver `src/shared/lib/usecases/`). Antes de asumir que
un UseCase concreto extiende la base genérica, verificar el archivo — los que tienen reglas de
negocio propias (`Upsert*`, `Delete*` de categorías/formas de pago, `GenerateMonthly*`) están
escritos como clase independiente, sin herencia.

### 3.1) DTOs de la serie de saldo (`src/entities/dashboard/model/balance-series.dto.ts`)

![Diagrama de DTOs de la serie de saldo](https://www.plantuml.com/plantuml/svg/ZT3FIWD130Rm-pn5tAEoKWKlU_9F4Jo8ee8KyP3EHXiwaompcTOgFf9FuOj9Ln6XNV3y9Vb-v3WR9YinW0-OATUjQJt5WEAfpfIOijkn6KM2BY2BotEM3XD6cAAVFoSjqfvfq0JB6HlzoTS7yubPucankl0gj_nACFepiapOtNDhCpWy6ZdNRy0OEQpEWovlT0bl3c2lnHKqa2snF4CrcKmczULbFHvNwv35QoHeG4gSKeBAanWkDFSflNGaUIZUttS0JnmGV2ejGai14dMQsJInDb04siyF1Ay2KHSScSGqk_SVw-dtfsxxHrqhYutlhlw15h8XiI-n13HUR4TlRVujZIesswpj3tThNePcE_hXiTzd6N95V1aa1ythkkrUjq6j3YhOhMke8igg6dXY0zzWvuv9sXA3-m80)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/clases-dto-balance-series.puml`](diagrams/clases-dto-balance-series.puml).*

`buildBalanceSeries(month, rows: DailyFlowRow[])` (`src/features/dashboard/lib/balance-series.ts`) es la
función pura que transforma `DailyFlowRow[]` (solo días con movimientos) en `BalanceSeriesDTO` (un punto
por cada día del mes, acumulado). Ver `docs/reglas-de-negocio.md` §3.7 para la regla completa.

### 3.2) DTO del resumen de movimientos (`src/entities/transaction/model/transaction-summary.dto.ts`)

![Diagrama del DTO de resumen de movimientos](https://www.plantuml.com/plantuml/svg/ZL9DRrCn4BpxLoplrAfDL25nYGGK1OHw24KaLPNZvjcyMB5tBU-QyD7-T_G-IbvB8xYjDRFZdTcz5CMi9GQe0ugJYLMUQ4OIhDKpJQJ4YFc7UQ5R5nsaW9wCx3mbp1XXW_MkoLp8pZbmXltMgnlXhQgyKyr-KzHTrKnB_zF1nOYopvXklTKjl7nrOKpN0Sl-su-PI_h2U_Xb0CvsdYpCeF9KStJLNUM-9qVYgXOKHItImicHzTHKTrL2RpjGMJ703AZ4ZSjleQeTANvZEGSg8O1uMDuiG3p1LnzGkgQQ2-cuwO4wlxxvj7fCdauDT2-eSx48sEIIq28apj3DVGR3X2VP9JurzuFJrI7imVJxrNNlDpBf5cOWcZqrKAtNw_LaiJWu-epU_XbmR4euCBWcE-7UIvl4_96VWqWVrt_gzEGZKbVTOfvLKhRS1V5ws5xRr9T7n3xqovL_o8rlOAYV2DuRy_ISfjCtHuAVmQRuOFy6JpBlvHowdPmQS-d8bXZCRm00)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/clases-dto-transaction-summary.puml`](diagrams/clases-dto-transaction-summary.puml).*

`buildTransactionSummary(rows: SummaryGroupRow[], month: string): TransactionSummaryDTO`
(`src/features/transactions/lib/transaction-summary.ts`) es la función pura que reduce las filas agrupadas
por `kind`+`status` al DTO del mes: acumula `totalIncome`/`totalExpenses` para todas las filas, y además
separa `totalPaid`/`totalPending` **solo** para las filas con `kind: "expense"`. Ver
`docs/reglas-de-negocio.md` §3.1 para la regla completa (por qué un ingreso pendiente no cuenta como deuda).

---

## 4) Jerarquía de errores (`src/shared/lib/errors.ts`)

![Diagrama de jerarquía de errores](https://www.plantuml.com/plantuml/svg/ZP91Qy9048Nl-okcNejWhJrKAdM9aIve0ccqq8jiagqk9hjXTu9Ws_zU4ajgqbHwVM_UDyFCJ2roWqMMGfnoAsnV6AEDiEGATo8JaATSAcBtKkNSy0mY7k-tHXSgSNIg3Hns4iMPNr8iHJGoAb2mMAjdUHGmE2iv69w_o0HtCBmR458bm2tR4i8ZYuR7UE80pVFAW7S2S9q9Q_bMm1Wi6gcsfHRhf2bOv5XOvoIh8ek4AUL489UfXJ4KQg_qGJsIp-_MQvxAXAFKwgTNXPr0RqqNR4P3vdiRDmZye4S0pZfCO3GOrA2PphZiWCpy9MN_0T02TqAXZF-OXgx29zSBcNDvefi6K1jvlC3p0_Pw6NTRupoDy_BqlqcU7sxc_igRTUH7TTxHwYsLCVxEExutNp0dx8ZVr_60erZ8J7Ra0ngwcmLRij3j665OCiWfzV3HxzT_HUe7g-JM9xJSi_Esd8wxTLGq3z4gQAosvJNMrlAQEo5aAbHIP2dv0W00)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/clases-errores.puml`](diagrams/clases-errores.puml).*
