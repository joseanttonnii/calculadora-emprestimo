"use client";

import { useState } from "react";

// Formata números em R$
const formatar = (v: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

// Taxas de empréstimo
const taxas = {
  tipo1: {
    liberado: { 0:4,1:7.5,2:8.25,3:8.75,4:9.5,5:9.99,6:10.75,7:11.25,8:11.75,9:12.25,10:12.99,11:13.75,12:14.49,13:16.5,14:17,15:17.49,16:18,17:19,18:19.99,19:22,20:24,21:24.99 },
    limite: {0:3.846153846153846,1:6.976744186046512,2:7.621329626546681,3:8.045977011494253,4:8.675799086757991,5:9.082644785889626,6:9.706546275395034,7:10.112359550561798,8:10.511882998171846,9:10.889021224513619,10:11.402070064686851,11:12.087912087912088,12:12.808771168579914,13:14.163090128755365,14:14.52991452991453,15:14.892752574687633,16:15.254237288135593,17:15.966386554621849,18:16.663888657388115,19:18.032786885245903,20:19.35483870967742,21:19.993599487959037}
  },
  tipo2: {
    liberado: { 0:5,1:8,2:9,3:10,4:10.5,5:11.5,6:12.5,7:13,8:14,9:14.5,10:14.99,11:15.75,12:16.75,13:17.5,14:17.75,15:20.5,16:21,17:21.5,18:24.75,19:27.99,20:28.99,21:29.99 },
    limite: {0:4.761904761904762,1:7.407407407407407,2:8.256880733944954,3:9.090909090909091,4:9.502262443438914,5:10.31390134529148,6:11.11111111111111,7:11.504424778761062,8:12.280701754385965,9:12.663755458515284,10:13.035916166623185,11:13.606911447084233,12:14.346938775510204,13:14.893617021276596,14:15.074324324324324,15:17.012448132780083,16:17.355371900826446,17:17.763280462184874,18:19.83974949759904,19:21.868858915108658,20:22.472322136923564,21:23.071978444188446}
  }
} as const;

type Tipo = keyof typeof taxas;
type Opcao = keyof typeof taxas["tipo1"];
type Parcelas = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21;

interface Resultado {
  valorLiberado: number;
  totalPagar: number;
  parcela: number | null;
}

// ====== HISTÓRICO ======
interface HistoricoItem {
  tipo: Tipo;
  parcelas: number;
  resultado: Resultado;
}

// Função de cálculo
function calcular({ tipo, opcao, valor, parcelas }: { tipo: Tipo, opcao: Opcao, valor: number, parcelas: number }): Resultado {
  const maxParcelas = Object.keys(taxas[tipo][opcao]).length - 1;
  const parcelasVal = Math.min(parcelas, maxParcelas) as Parcelas;

  const taxa = taxas[tipo][opcao][parcelasVal] / 100;

  let valorLiberado: number;
  let totalPagar: number;

  if (opcao === "liberado") {
    valorLiberado = valor;
    totalPagar = valor + valor * taxa;
  } else {
    valorLiberado = valor - valor * taxa;
    totalPagar = valor;
  }

  const parcela = parcelasVal > 0 ? totalPagar / parcelasVal : null;

  return { valorLiberado, totalPagar, parcela };
}

// Função para copiar texto
function copiarTexto(texto: string) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).then(() => alert("Resultado copiado!")).catch(() => fallbackCopy(texto));
  } else {
    fallbackCopy(texto);
  }
}

function fallbackCopy(texto: string) {
  const textarea = document.createElement("textarea");
  textarea.value = texto;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try { document.execCommand("copy"); alert("Resultado copiado!"); } 
  catch { alert("Não foi possível copiar o resultado."); }
  document.body.removeChild(textarea);
}

// Componente principal
export default function Calculadora() {
  const [tipo, setTipo] = useState<Tipo>("tipo1");
  const [opcao, setOpcao] = useState<Opcao>("liberado");
  const [valor, setValor] = useState<string>("");
  const [parcelas, setParcelas] = useState<number>(1);
  const [res, setRes] = useState<Resultado | null>(null);

  // ====== HISTÓRICO ======
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const handleCalcular = () => {
    const numValor = Number(valor);
    if (isNaN(numValor) || numValor <= 0) { alert("Digite um valor válido"); return; }

    const resultado = calcular({ tipo, opcao, valor: numValor, parcelas });
    setRes(resultado);

    setHistorico(prev => {
      const novo = [{ tipo, parcelas, resultado }, ...prev];
      return novo.slice(0, 3);
    });
  };

  const handleCopiar = () => {
    if (!res) return;

    const tipoCartao = tipo === "tipo1" ? "VISA/MASTER" : "ELO/HIPER";

    const texto = `
=====AlexandreCred=====

Cartão: ${tipoCartao}
Valor Liberado: R$ ${formatar(res.valorLiberado)}
Prazo: ${parcelas > 0 ? `${parcelas}x` : '-'}
Parcela: R$ ${res.parcela !== null ? formatar(res.parcela) : '-'}
Total a pagar: R$ ${formatar(res.totalPagar)}
    `;
    copiarTexto(texto.trim());
  };

  const tipoCartaoDisplay = tipo === "tipo1" ? "VISA/MASTER" : "ELO/HIPER";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-3 gap-6">

        {/* Painel Entrada */}
        <div className="bg-zinc-900/70 backdrop-blur rounded-2xl p-6 space-y-4 shadow-xl">
          <h1 className="text-2xl font-bold text-purple-400">Calculadora de Empréstimo</h1>
          <p className="text-sm text-zinc-400">Simulação AlexandreCred</p>

          <div className="space-y-3">
            <select className="w-full p-2 rounded bg-zinc-800" value={tipo} onChange={e => setTipo(e.target.value as Tipo)}>
              <option value="tipo1">VISA/MASTER</option>
              <option value="tipo2">ELO/HIPER</option>
            </select>

            <select className="w-full p-2 rounded bg-zinc-800" value={opcao} onChange={e => setOpcao(e.target.value as Opcao)}>
              <option value="liberado">Liberado</option>
              <option value="limite">Limite</option>
            </select>

            <input
              type="number"
              className="w-full p-2 rounded bg-zinc-800"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="Valor do empréstimo"
            />

            <select className="w-full p-2 rounded bg-zinc-800" value={parcelas} onChange={e => setParcelas(Number(e.target.value))}>
              {Array.from({ length: 22 }).map((_, i) => <option key={i} value={i}>{i}x</option>)}
            </select>

            <button className="w-full bg-purple-600 hover:bg-purple-700 transition p-2 rounded font-semibold" onClick={handleCalcular}>
              Calcular
            </button>
          </div>
        </div>

        {/* Painel Resultado */}
        <div className="bg-zinc-900/70 backdrop-blur rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Resultado</h2>
            {res ? (
              <div className="space-y-2 text-sm">
                <p><span className="text-zinc-400">Cartão:</span> {tipoCartaoDisplay}</p>
                <p><span className="text-zinc-400">Valor Liberado:</span> R$ {formatar(res.valorLiberado)}</p>
                <p><span className="text-zinc-400">Prazo:</span> {parcelas}x</p>
                <p><span className="text-zinc-400">Parcela:</span> R$ {res.parcela !== null ? formatar(res.parcela) : '-'}</p>
                <p className="text-lg font-bold"><span className="text-zinc-400">Total a pagar:</span> R$ {formatar(res.totalPagar)}</p>
              </div>
            ) : (
              <p className="text-zinc-500">Preencha os dados para calcular</p>
            )}
          </div>

          {res && (
            <button className="mt-4 border border-dashed border-purple-500 text-purple-400 p-2 rounded" onClick={handleCopiar}>
              Copiar Resultado
            </button>
          )}
        </div>

        {/* Painel Histórico */}
        <div className="bg-zinc-900/70 backdrop-blur rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">Últimas Simulações</h2>

          {historico.length === 0 && (
            <p className="text-zinc-500 text-sm">Nenhuma simulação ainda</p>
          )}

          <div className="space-y-3 text-sm">
            {historico.map((item, index) => (
              <div key={index} className="border border-zinc-700 rounded p-3">
                <p><span className="text-zinc-400">Cartão:</span> {item.tipo === "tipo1" ? "VISA/MASTER" : "ELO/HIPER"}</p>
                <p><span className="text-zinc-400">Prazo:</span> {item.parcelas}x</p>
                <p><span className="text-zinc-400">Parcela:</span> R$ {item.resultado.parcela !== null ? formatar(item.resultado.parcela) : '-'}</p>
                <p><span className="text-zinc-400">Liberado:</span> R$ {formatar(item.resultado.valorLiberado)}</p>
                <p><span className="text-zinc-400">Total:</span> R$ {formatar(item.resultado.totalPagar)}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
