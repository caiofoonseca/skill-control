"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatCurrencyInput } from "@/lib/payments/money";

import { CompletePaymentModal } from "./complete-payment-modal";
import { ContratanteBlock, SignatureLine, SignerControls, type SignerOption } from "./signer-selector";

export type MaterialPlanSummary = {
  installmentCount: number;
  amountPerInstallmentFormatted: string;
  validFromFormatted: string | null;
  validUntilFormatted: string | null;
};

export type MainPlanSummary = {
  totalAmountFormatted: string;
  installmentCount: number;
  firstDueDateFormatted: string | null;
};

type ContractDocumentProps = {
  studentId: string;
  studentFullName: string;
  signerOptions: SignerOption[];
  selectedKey: SignerOption["key"];
  onSelectedKeyChange: (key: SignerOption["key"]) => void;
  isPaymentModalOpen: boolean;
  onPaymentModalOpenChange: (open: boolean) => void;
  contractedStages: string | null;
  contractStartDateFormatted: string | null;
  contractEndDateFormatted: string | null;
  lessonsStartDateFormatted: string | null;
  lessonsEndDateFormatted: string | null;
  vacationPeriod: string | null;
  material: MaterialPlanSummary | null;
  main: MainPlanSummary | null;
  enrollmentFeeFormatted: string | null;
  leaveAuthorization: "authorized" | "not_authorized" | null;
  todayFormatted: string;
};

function ClauseTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-6 text-sm font-bold uppercase tracking-wide">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm leading-7 text-justify">{children}</p>;
}

function ManualBlank({
  value,
  onChange,
  width = "220px",
  inputMode,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  width?: string;
  inputMode?: "numeric";
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="inline-block border-0 border-b border-[var(--foreground)] bg-transparent px-1 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:bg-[rgba(182,133,58,0.08)]"
      style={{ width, minHeight: "1.4em" }}
    />
  );
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  let result = digits.slice(0, 2);
  if (digits.length > 2) result += "/" + digits.slice(2, 4);
  if (digits.length > 4) result += "/" + digits.slice(4, 8);
  return result;
}

export function ContractDocument({
  studentId,
  studentFullName,
  signerOptions,
  selectedKey,
  onSelectedKeyChange,
  isPaymentModalOpen,
  onPaymentModalOpenChange,
  contractedStages,
  contractStartDateFormatted,
  contractEndDateFormatted,
  lessonsStartDateFormatted,
  lessonsEndDateFormatted,
  vacationPeriod,
  material,
  main,
  enrollmentFeeFormatted,
  leaveAuthorization,
  todayFormatted,
}: ContractDocumentProps) {
  const router = useRouter();
  const selected = signerOptions.find((option) => option.key === selectedKey) ?? signerOptions[0];

  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});

  function manualBlank(id: string, width?: string) {
    return (
      <ManualBlank
        value={manualValues[id] ?? ""}
        onChange={(value) => setManualValues((current) => ({ ...current, [id]: value }))}
        width={width}
      />
    );
  }

  function manualMoneyBlank(id: string, width?: string) {
    return (
      <ManualBlank
        value={manualValues[id] ?? ""}
        onChange={(value) => setManualValues((current) => ({ ...current, [id]: formatCurrencyInput(value) }))}
        width={width}
        inputMode="numeric"
      />
    );
  }

  function manualDateBlank(id: string, width = "115px") {
    return (
      <ManualBlank
        value={manualValues[id] ?? ""}
        onChange={(value) => setManualValues((current) => ({ ...current, [id]: formatDateInput(value) }))}
        width={width}
        inputMode="numeric"
        placeholder="DD/MM/AAAA"
      />
    );
  }

  function manualCheckbox(id: string) {
    return (
      <input
        type="checkbox"
        checked={manualChecks[id] ?? false}
        onChange={(event) => {
          const checked = event.currentTarget.checked;
          setManualChecks((current) => ({ ...current, [id]: checked }));
        }}
        className="h-4 w-4 align-middle accent-[var(--primary)]"
      />
    );
  }

  function handlePaymentSaved(values: Record<string, string>) {
    setManualValues((current) => ({ ...current, ...values }));
    onPaymentModalOpenChange(false);
    router.refresh();
  }

  return (
    <article className="mx-auto max-w-3xl bg-white px-2 py-4 text-[var(--foreground)] print:px-0 print:py-0">
      <div className="mb-4 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- plain img prints reliably; next/image adds nothing here */}
        <img src="/brand/skill-logo.png" alt="Skill Idiomas" className="h-16 w-auto object-contain" />
      </div>

      <P>
        Pelo presente Instrumento Particular de Prestação de Serviços, de um lado, e na
        melhor forma de direito, <strong>DICAS SERVIÇOS EDUCACIONAIS DE IDIOMAS LTDA-ME,</strong> pessoa
        jurídica inscrita no CNPJ/MF sob o nº. 30.913.274/0001-32, com sede à Rua da Amizade,
        126, no bairro das Graças, Recife, PE, empresa franqueada da rede de escolas{" "}
        <strong>SKILL IDIOMAS</strong>, de ora em diante denominada &ldquo;SKILL IDIOMAS GRAÇAS&rdquo; e de
        outro lado, o (a) contratante abaixo qualificado, aqui designado &ldquo;ALUNO&rdquo;, assinam o
        presente contrato e regulamento de prestação de serviços educacionais de cursos livres
        de língua estrangeira, regido pelas seguintes cláusulas:
      </P>

      <div className="mt-4 rounded-lg border border-[var(--border)] px-4 py-3 print:border-black">
        <SignerControls options={signerOptions} selectedKey={selectedKey} onChange={onSelectedKeyChange} />
        <div className="mt-2">
          <ContratanteBlock
            selected={selected}
            studentFullName={studentFullName}
            renderManualBlank={manualBlank}
          />
        </div>
      </div>

      {isPaymentModalOpen ? (
        <CompletePaymentModal
          studentId={studentId}
          onClose={() => onPaymentModalOpenChange(false)}
          onSaved={handlePaymentSaved}
        />
      ) : null}

      <h1 className="mt-6 text-center text-base font-bold uppercase">
        Contrato Anual de Prestação de Serviços Educacionais
      </h1>

      <ClauseTitle>Cláusula I – Do compromisso da escola</ClauseTitle>
      <P>
        §1º O objeto do presente contrato é a prestação de serviços educacionais a qual a SKILL
        IDIOMAS GRAÇAS se obriga a prestar ao ALUNO, com alto padrão de qualidade, respeitando
        todas as exigências legais pertinentes à atividade.
      </P>
      <P>
        §2º É de inteira responsabilidade da CONTRATADA, o planejamento do ensino que se refere
        à fixação de carga horária, designação de professores, salas de aulas, orientação
        didático-pedagógica e educacional, além de outras providências que as atividades
        docentes exigirem. Obedecendo ao seu exclusivo critério, sem exigências do (a)
        CONTRATANTE.
      </P>
      <P>
        §3º Caso o instrutor da turma não compareça na data/horário marcados, a CONTRATADA se
        obriga a providenciar um substituto ou uma aula extra, como reposição de uma possível
        perda, sem custo adicional ao CONTRATANTE.
      </P>

      <ClauseTitle>Cláusula II – Do compromisso do aluno</ClauseTitle>
      <P>
        §1º Assistir às aulas nos dias, horário e local previstos, num total mínimo de 90%, o
        que inclui, também, entregar 90% dos trabalhos de casa, para sua aprovação ao próximo
        estágio. A tolerância para chegar atrasado é de 10 minutos;
      </P>
      <P>
        §3º Realizar os trabalhos de casa (caderno de exercícios e outros) e ouvir os áudios
        correspondente às lições vistas;
      </P>
      <P>
        §4º Manter sempre uma postura educada no ambiente da escola e participar das atividades
        culturais desenvolvidas pela escola;
      </P>
      <P>
        §5º Concluir seu módulo na data prevista neste instrumento. Não ocorrendo tal fato, em
        virtude de frequentes cancelamentos ou faltas, as aulas excedentes ao prazo final,
        previsto para o estágio, serão cobradas à parte. Utilizando-se para tanto, o valor total
        do contrato, dividido pelo número de aulas contratadas e multiplicado pelas horas
        excedentes;
      </P>
      <P>
        §6º Zelar pelo patrimônio/instalações da CONTRATADA, posto que qualquer dano, provocado
        pelo aluno, é de responsabilidade dele.
      </P>
      <P>
        §7º Fica vetado o uso de quaisquer aparelhos que possam vir a atrapalhar a concentração
        e ou andamento da aula.
      </P>

      <ClauseTitle>Cláusula III – Dos estágios e da vigência do contrato</ClauseTitle>
      <P>
        Este contrato terá a vigência de{" "}
        {contractStartDateFormatted ? (
          <strong>{contractStartDateFormatted}</strong>
        ) : (
          manualDateBlank("contract_start_date", "120px")
        )}{" "}
        a{" "}
        {contractEndDateFormatted ? (
          <strong>{contractEndDateFormatted}</strong>
        ) : (
          manualDateBlank("contract_end_date", "120px")
        )}
        . Aulas iniciam em{" "}
        {lessonsStartDateFormatted ? (
          <strong>{lessonsStartDateFormatted}</strong>
        ) : (
          manualDateBlank("lessons_start_date", "120px")
        )}{" "}
        e terminam em{" "}
        {lessonsEndDateFormatted ? (
          <strong>{lessonsEndDateFormatted}</strong>
        ) : (
          manualDateBlank("lessons_end_date", "120px")
        )}
        , com férias em{" "}
        {vacationPeriod ? <strong>{vacationPeriod}</strong> : manualBlank("vacation_period", "160px")}, e a
        sua renovação se obterá de forma automática, salvo aviso prévio e por escrito do (a)
        CONTRATANTE com 1 (um) mês de antecedência.
      </P>
      <P>
        A carga horária será de <strong>35 horas/aulas por semestre</strong>, exceto feriados
        e/ou recessos, de acordo com o calendário da unidade CONTRATADA, divulgado durante
        semestre letivo, ou situações especiais que ocorram, independentemente da vontade da
        CONTRATADA.
      </P>
      <P>
        §1º Os Estágios contratados pelo ALUNO são{" "}
        {contractedStages ? <strong>{contractedStages}</strong> : manualBlank("contracted_stages", "320px")}
      </P>
      <P>
        §2º O aluno receberá o certificado se atingir a média igual ou superior a 7 (sete), no
        prazo de 60 dias após o término do curso. Não podendo, em hipótese alguma, ser
        fornecido ao aluno com rompimento do curso ou do presente contrato.
      </P>

      <ClauseTitle>Cláusula IV – Do material didático</ClauseTitle>
      <P>
        §1º O fornecimento do material didático, de autoria da SKILL FRANQUEADORA, é de uso
        individual e obrigatório do aluno. O CONTRATANTE declara ter plena ciência de que no
        valor da prestação de serviços, não está incluído o custo do material didático. Sendo
        esse, adquirido pelo Contratante, às suas próprias expensas, de acordo com as opções
        selecionadas abaixo, parcelado em:
      </P>
      {material ? (
        <P>
          (X) <strong>{material.installmentCount}</strong> vezes, no valor de{" "}
          <strong>{material.amountPerInstallmentFormatted}</strong> cada, válido de{" "}
          {material.validFromFormatted ? (
            <strong>{material.validFromFormatted}</strong>
          ) : (
            manualDateBlank("material_valid_from", "120px")
          )}{" "}
          até{" "}
          {material.validUntilFormatted ? (
            <strong>{material.validUntilFormatted}</strong>
          ) : (
            manualDateBlank("material_valid_until", "120px")
          )}
          .
        </P>
      ) : (
        <>
          <P>
            {manualCheckbox("material_l1_selected")} {manualBlank("material_l1_vezes", "40px")} vezes, a parte{" "}
            {manualBlank("material_l1_parte", "40px")} no {manualMoneyBlank("material_l1_valor", "120px")} válido
            de {manualDateBlank("material_l1_de", "100px")} até {manualDateBlank("material_l1_ate", "100px")}
          </P>
          <P>
            {manualCheckbox("material_l2_selected")} {manualBlank("material_l2_vezes", "40px")} vezes, a parte{" "}
            {manualBlank("material_l2_parte", "40px")} no {manualMoneyBlank("material_l2_valor", "120px")} válido
            de {manualDateBlank("material_l2_de", "100px")} até {manualDateBlank("material_l2_ate", "100px")}{" "}
            {manualCheckbox("material_l2_a_quitar")} A quitar
          </P>
          <P>
            {manualCheckbox("material_l3_selected")} {manualBlank("material_l3_vezes", "40px")} vezes, o material
            anual, no valor de {manualMoneyBlank("material_l3_valor", "120px")} válido de{" "}
            {manualDateBlank("material_l3_de", "100px")} até {manualDateBlank("material_l3_ate", "100px")}
          </P>
        </>
      )}
      <P>
        §3º Ocorrendo à rescisão do presente contrato, por qualquer motivo que seja, o
        CONTRATANTE declara ciência de que o valor do material não será considerado na
        rescisão contratual.
      </P>
      <P>
        §4º É vedada a comercialização e reprodução, em todo ou em parte, do material didático
        pelo CONTRATANTE e/ou ALUNO, seja com outros alunos seja com terceiros, sob pena de
        responder cível e criminalmente por desrespeito a lei de direitos autorais, além de
        perdas e danos que a SKILL e/ou a UNIDADE SKILL vierem a sofrer.
      </P>

      <ClauseTitle>Cláusula V – Dos valores do serviço prestado, das multas e moras</ClauseTitle>
      <P>
        Pelos serviços prestados, referidos na Cláusula I, o CONTRATANTE pagará à SKILL IDIOMAS
        GRAÇAS a importância de{" "}
        {main ? <strong>{main.totalAmountFormatted}</strong> : manualMoneyBlank("main_total_amount", "160px")} (
        {manualBlank("main_total_amount_extenso", "360px")} por extenso) PARCELADOS EM{" "}
        {main ? <strong>{main.installmentCount}</strong> : manualBlank("main_installment_count", "40px")} VEZES e
        Taxa de Matrícula no valor de{" "}
        {enrollmentFeeFormatted ? (
          <strong>{enrollmentFeeFormatted}</strong>
        ) : (
          manualMoneyBlank("enrollment_fee", "130px")
        )}
        .
      </P>
      <P>
        §1º A matrícula, bem como a primeira parcela DEVERÃO ser pagas no ato da matrícula,{" "}
        {main?.firstDueDateFormatted ? (
          <strong>{main.firstDueDateFormatted}</strong>
        ) : (
          manualDateBlank("main_first_due_date", "120px")
        )}
        , como sinal, garantia e princípio de pagamento, como condição para concretização e
        celebração deste contrato de prestação de serviços. Sendo as demais parcelas, quitadas
        através de cartão de crédito. Caso NÃO seja celebrado pagamento da primeira parcela à
        vista, como forma de entrada, sendo o total de valores lançados no cartão de crédito, a
        Escola só receberá a primeira parcela em 30 dias. Nesse caso, esta parcela inicial será
        considerada como a parcela do mês que o aluno iniciou o período das aulas.
      </P>
      <P>
        As parcelas de recebimento para a Escola, começam em{" "}
        {manualDateBlank("main_installments_start_date", "120px")} e terminam em{" "}
        {manualDateBlank("main_last_due_date", "120px")}, mesmo as aulas finalizando em{" "}
        {lessonsEndDateFormatted ? (
          <strong>{lessonsEndDateFormatted}</strong>
        ) : (
          manualDateBlank("lessons_end_date", "120px")
        )}
        . Os pagamentos celebrados, podem divergir entre o recebimento da Escola e o vencimento
        da fatura do cartão de crédito do cliente.
      </P>
      <P>
        §2º Em caso de atraso no pagamento de qualquer parcela, o CONTRATANTE pagará, além do
        valor principal, juros moratórios de 1% ao mês, acrescido de multa de 2%.
      </P>
      <P>
        §3º Em caso de pagamento de parcelas em atraso, o aluno só poderá efetuar seus pagamentos
        mediante pix, cartão de débito ou em espécie.
      </P>
      <P>
        §4º Fica o Contratante ciente, neste ato, que não está pagando mensalidade e sim
        parcelas, correspondentes a um pagamento integral, do qual a SKILL IDIOMAS GRAÇAS
        faculta ao CONTRATANTE o direito de parcelar o valor, e cujos vencimentos estão
        pré-determinados no §1º desta Cláusula.
      </P>
      <P>
        §5º Novos descontos, resultantes de parcerias ou convênios constituídos durante a
        vigência deste contrato, somente serão válidos a partir do próximo contrato.
      </P>
      <P>
        §6º Os alunos admitidos com descontos promocionais ou oriundos de convênios perderão o
        valor do referido desconto em caso de pagamento em atraso.
      </P>
      <P>
        §7º Os descontos concedidos pela CONTRATADA, em virtude de convênios com outras
        entidades, não são cumulativos, podendo incidir uma única vez sobre as parcelas devidas,
        adotando-se o que for mais benéfico ao (à) CONTRATANTE ou o que for expressamente
        indicado por este último.
      </P>

      <ClauseTitle>Cláusula VI – Do inadimplemento e cancelamento do contrato</ClauseTitle>
      <P>
        Na hipótese de atraso no pagamento superior a 30 (trinta) dias, a SKILL GRAÇAS poderá
        efetuar a cobrança pelos meios previstos na legislação comum aplicável, recusar a
        renovação de matrícula para o período letivo seguinte, cancelar, independentemente de
        interpelação, o presente contrato, cessando a prestação dos serviços.
      </P>
      <P>
        §1º O presente instrumento tem força de título executivo extrajudicial nos termos do
        artigo 585 do CPC, e obriga tanto aos signatários como seus herdeiros e sucessores.
      </P>
      <P>
        §2º O contratante está ciente de que a opção de parcelamento do curso foi realizada em{" "}
        {main ? <strong>{main.installmentCount}</strong> : manualBlank("main_installment_count", "40px")} vezes e
        que parcelas serão pagas em meses que o aluno não terá aula.
      </P>

      <ClauseTitle>Cláusula VII – Da desistência da matrícula</ClauseTitle>
      <P>
        A desistência da matrícula deve ser requerida pelo ALUNO ou através de seu
        representante, por escrito, através de REQUERIMENTO DE DESISTÊNCIA em formulário
        específico mantido à sua disposição para este fim na Secretaria da SKILL GRAÇAS,
        dependendo, a sua efetivação, da quitação dos débitos, caso existentes, não dispensando,
        a SKILL GRAÇAS, dos meios legais para cobrar prejuízos advindos da desistência do ALUNO.
      </P>
      <P>
        §1º Será(ão) devida(s) a(s) parcela(s) com vencimento até o trigésimo dia após a data de
        efetivação da desistência do aluno.
      </P>
      <P>
        §2º No caso de desistência, em qualquer período, serão cobradas a parcela do mês do
        cancelamento do contrato e mais 01 (uma) parcela, como forma de multa contratual. Serão
        devolvidas as parcelas restantes, caso haja, por reembolso de pagamento em cartão de
        crédito, de acordo com a entrada dos valores, mês a mês, sempre no dia 30 de cada mês,
        independentemente da data que a venda foi celebrada.
      </P>
      <P>
        §3º Tendo o módulo transcorrido mais de 70% (setenta por cento) de seu total, assistido
        ou não pelo aluno, não será aceita solicitação de cancelamento, sendo este contrato
        devido no seu total.
      </P>
      <P>§4º Faltas e/ou aulas não assistidas não serão deduzidas das parcelas ainda não pagas.</P>
      <P>
        §5º Fica entendido e pactuado que a simples falta às aulas, pelo ALUNO, não ensejará a
        rescisão contratual, sendo devido o pagamento das parcelas contratadas com os
        acréscimos moratórios previstos até a data da entrega do Requerimento de Desistência.
      </P>
      <P>§6º O cálculo devido para devolução é feito pelo valor total pago, dividido em 12 vezes.</P>
      <P>
        §7º Caso exista apenas o pagamento da taxa de matrícula (reserva) e o aluno manifeste a
        vontade de cancelar, antes do início das aulas, o valor será estornado. Para casos em
        que configuram pagos, a taxa e parcelas do curso, vale a regra da multa, para os casos
        de desistência (§2º).
      </P>
      <P>
        §8º O material didático, como é solicitado pelo site Skill, única e exclusivamente para
        o aluno, não é passivo de devolução de valores.
      </P>

      <ClauseTitle>Cláusula VIII – Da reposição</ClauseTitle>
      <P>
        §1º Fica entendido que, em caso de faltas, mediante justificativa, o aluno poderá marcar
        reposição de aula, agendando nos horários disponíveis da Escola, sem custo.
      </P>

      <ClauseTitle>
        Cláusula IX – Do número mínimo de alunos, horários, fusão e formação de grupo de classe
      </ClauseTitle>
      <P>
        Os grupos de classe serão formados com o número mínimo de 6 (seis) alunos, estando os
        grupos com número de alunos inferior a 6 sujeitos a mudança de horários e/ou fusão com
        outro(s) grupo(s).
      </P>
      <P>
        §1º Caso o aluno necessite trocar de horário, deverá fazer uma solicitação, por escrito,
        através de requerimento disponível na secretaria da escola.
      </P>

      <ClauseTitle>Cláusula X – Da não formação e do desfazimento de grupo de classe</ClauseTitle>
      <P>
        Ocorrendo a não formação do grupo, por insuficiência de alunos, o valor da parcela paga
        será devolvido integralmente. Caso aulas tenham sido ministradas antes do desfazimento
        do grupo, o valor destas será deduzido do valor total de parcelas já pagas pelo aluno.
      </P>

      <ClauseTitle>
        Cláusula XI – Da fusão de grupos de classe, mudança de professores e cancelamento de matrícula
      </ClauseTitle>
      <P>
        A SKILL GRAÇAS reserva-se o direito de fundir grupos e de mudar professores, bem como, o
        de cancelar matrícula de alunos que desobedecerem aos princípios básicos de ensino e
        comportamentos que possam prejudicar o interesse da instituição.
      </P>

      <ClauseTitle>Cláusula XII – Da renovação do contrato</ClauseTitle>
      <P>
        §1º Sempre que houver valores pagos para o próximo módulo, entende-se que houve
        renovação automática, com as mesmas cláusulas vigentes, sem que haja necessidade da
        assinatura em um novo contrato.
      </P>

      <ClauseTitle>Cláusula XIII – Da proteção de dados pessoais</ClauseTitle>
      <P>
        §1º A SKILL IDIOMAS, por si e por seus colaboradores, obriga-se a atuar no presente
        Contrato em conformidade com a Legislação vigente sobre Proteção de Dados Pessoais e as
        determinações de órgãos reguladores/fiscalizadores sobre a matéria, em especial a Lei
        13.709/2018, além das demais normas e políticas de proteção de dados onde houver
        qualquer tipo de tratamento dos dados do CONTRATANTE.
      </P>

      <ClauseTitle>Cláusula XIV – Considerações finais</ClauseTitle>
      <P>
        §1º O CONTRATANTE e/ou ALUNO, desde já, autoriza a UNIDADE SKILL a utilizar
        gratuitamente e livre de qualquer ônus a imagem do ALUNO para fins exclusivos de
        divulgação da escola/suas atividades, podendo, para tanto, reproduzi-la ou divulgá-la
        junto à internet, intranet, jornais, redes sociais e todos os demais meios de
        comunicação, públicos ou privados por prazo indeterminado. A UNIDADE SKILL fica
        autorizada a proceder aos cortes e as reproduções necessárias no material criado e
        divulgado responsabilizando-se pela guarda e pela utilização da obra final produzida.
      </P>
      <P>
        §2º Em caso de cursos especiais, a contratada anexará a este instrumento, aditivo
        contratual contendo as informações e ou regras para cobranças de taxa de matrícula,
        carga horária diferenciada ou modalidades diferentes do curso regular.
      </P>
      <P>
        §3º Reservam-se as partes do direito de fazer valer as cláusulas e parágrafos acordados
        espontaneamente, e sob nenhuma hipótese o contratante poderá alegar que desconhece as
        cláusulas e incisos aqui citados, ou que não houve explicação da atendente.
      </P>
      <P>
        §4º Para os casos de cursos em horários promocionais, o aluno fica ciente que, havendo
        necessidade, por parte do contratante, em mudar para um horário que não seja
        promocional, deverá ser lançada a diferença dos valores financeiros.
      </P>
      <P>
        §5º Para efeito de descontos de parcerias ou convênios, os benefícios não são
        cumulativos, caso a matrícula já tenha sido realizada em alguma campanha promocional.
      </P>

      <ClauseTitle>Cláusula XV – Do foro competente</ClauseTitle>
      <P>
        As partes elegem o Foro da cidade de Recife, estado de Pernambuco, para dirimir
        quaisquer dúvidas ou controvérsias oriundas deste contrato, que é regido pela Lei 8078,
        de 11/09/1990 e demais disposições legais. E por estarem justos e contratados, assinam o
        presente contrato em duas vias de igual teor na presença das testemunhas abaixo.
      </P>

      <div className="mt-4 space-y-2">
        <p className="text-sm leading-7">
          ({leaveAuthorization === "authorized" ? "X" : " "}) AUTORIZO o aluno, o qual sou responsável, a sair
          da SKILL GRAÇAS, sem o portador, por qualquer motivo que seja.
        </p>
        <p className="text-sm leading-7">
          ({leaveAuthorization === "not_authorized" ? "X" : " "}) NÃO autorizo o aluno, o qual sou responsável,
          a sair da SKILL GRAÇAS, sem o portador, por qualquer motivo que seja.
        </p>
      </div>

      <p className="mt-8 text-sm">
        Recife, PE, <strong>{todayFormatted}</strong>
      </p>

      <div className="mt-4 grid gap-10 sm:grid-cols-2">
        <SignatureLine selected={selected} />
        <div className="mt-16 text-center text-sm">
          <div className="mx-auto w-80 border-t border-[var(--foreground)] pt-2">
            Dicas Serviços Educacionais de Idiomas LTDA-ME
          </div>
          <p className="mt-1 font-semibold">CNPJ: 30.913.274/0001-32</p>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-[var(--muted-foreground)]">
        Dicas Serviços Educacionais de Idiomas Ltda. Rua da Amizade 126, Graças. Fones: (81)
        3222-3755 / 9-9198-1725 @skillgraças
      </p>
    </article>
  );
}
