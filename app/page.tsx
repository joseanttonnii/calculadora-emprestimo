"use client";

import { useState } from "react";

// Formata números em R$
const formatar = (v: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const taxas = {
  tipo1: {
    liberado: { 0: 4, 1: 7.5, 2: 8.25, 3: 8.75, 4: 9.5, 5: 9.99, 6: 10.75, 7: 11.25, 8: 11.75, 9: 12.25, 10: 12.99, 11: 13.75, 12: 14.49, 13: 16.5, 14: 17, 15: 17.49, 16: 18, 17: 19, 18: 19.99, 19: 22, 20: 24, 21: 24.99 },
    limite: { 0: 3.846153846153846, 1: 6.976744186046512, 2: 7.621329626546681, 3: 8.045977011494253, 4: 8.675799086757991, 5: 9.082644785889626, 6: 9.706546275395034, 7: 10.112359550561798, 8: 10.511882998171846, 9: 10.91314031180400890868596882, 10: 11.49650411549694645543853447, 11: 12.087912087912088, 12: 12.65608350065503524301249013, 13: 14.163090128755365, 14: 14.52991452991453, 15: 14.88573495616656902723593583, 16: 15.254237288135593, 17: 15.966386554621849, 18: 16.65972164347028919076589716, 19: 18.032786885245903, 20: 19.35483870967742, 21: 19.993599487959037 }
  },
  tipo2: {
    liberado: { 0: 5, 1: 8, 2: 9, 3: 10, 4: 10.5, 5: 11.5, 6: 12.5, 7: 13, 8: 14, 9: 14.5, 10: 14.99, 11: 15.75, 12: 16.75, 13: 17.5, 14: 17.75, 15: 20.5, 16: 21, 17: 21.5, 18: 24.75, 19: 27.99, 20: 28.99, 21: 29.99 },
    limite: { 0: 4.761904761904762, 1: 7.407407407407407, 2: 8.256880733944954, 3: 9.090909090909091, 4: 9.502262443438914, 5: 10.31390134529148, 6: 11.11111111111111, 7: 11.504424778761062, 8: 12.280701754385965, 9: 12.663755458515284, 10: 13.035916166623185, 11: 13.606911447084233, 12: 14.346938775510204, 13: 14.893617021276596, 14: 15.074324324324324, 15: 17.012448132780083, 16: 17.355371900826446, 17: 17.763280462184874, 18: 19.83967935871743486973947896, 19: 21.868858915108658, 20: 22.472322136923564, 21: 23.071978444188445955042772675 }
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

interface HistoricoItem {
  tipo: Tipo;
  parcelas: number;
  resultado: Resultado;
}

export default function Calculadora() {
  const [tipo, setTipo] = useState<Tipo>("tipo1");
  const [opcao, setOpcao] = useState<Opcao>("liberado");
  const [valor, setValor] = useState<string>("");
  const [parcelas, setParcelas] = useState<number>(1);
  const [res, setRes] = useState<Resultado | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarMaquinas, setMostrarMaquinas] = useState(false);

  // LOGICA DAS MAQUINAS ATUALIZADA
  const checarMaquina = (t: Tipo, p: number) => {
    const m1 = t === "tipo1" && p <= 8; // Pag Bank: VISA/MASTER 0-8x
    const m2 = t === "tipo1" && p >= 9 && p <= 12; // Infinity: VISA/MASTER 9-12x
    const m3 = (t === "tipo1" && p >= 13) || (t === "tipo2" && p >= 5); // Rede: VISA 13-21x / ELO 5-21x
    const m4 = t === "tipo2" && p <= 4; // Mercado Pago: ELO 0-4x
    return { m1, m2, m3, m4 };
  };

  const status = checarMaquina(tipo, parcelas);
  const isM1 = res && status.m1;
  const isM2 = res && status.m2;
  const isM3 = res && status.m3;
  const isM4 = res && status.m4;

  const getMaquinaRecomendada = (t: Tipo, p: number) => {
    const s = checarMaquina(t, p);
    if (s.m1) return "Pag Bank";
    if (s.m2) return "Infinity";
    if (s.m3) return "Rede";
    if (s.m4) return "Mercado Pago";
    return "N/A";
  };

  const handleCopiar = () => {
    if (!res) return;
    const texto = `=====AlexandreCred=====\n\nCartão: ${tipo === "tipo1" ? "VISA/MASTER" : "ELO/HIPER"}\nValor Liberado: R$ ${formatar(res.valorLiberado)}\nPrazo: ${parcelas}x\nParcela: R$ ${res.parcela ? formatar(res.parcela) : '-'}\nTotal a pagar: R$ ${formatar(res.totalPagar)}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(() => alert("Copiado!")).catch(() => alert("Erro ao copiar"));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = texto;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert("Copiado!");
    }
  };

  const calcular = () => {
    const numValor = Number(valor);
    if (isNaN(numValor) || numValor <= 0) return;
    const maxParcelas = Object.keys(taxas[tipo][opcao]).length - 1;
    const parcelasVal = Math.min(parcelas, maxParcelas) as Parcelas;
    const taxa = taxas[tipo][opcao][parcelasVal] / 100;
    
    let valorLiberado, totalPagar;
    if (opcao === "liberado") {
      valorLiberado = numValor;
      totalPagar = numValor + numValor * taxa;
    } else {
      valorLiberado = numValor - numValor * taxa;
      totalPagar = numValor;
    }
    const resultado = { valorLiberado, totalPagar, parcela: parcelasVal > 0 ? totalPagar / parcelasVal : null };
    setRes(resultado);
    setHistorico(prev => [{ tipo, parcelas, resultado }, ...prev].slice(0, 3));
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center overflow-x-hidden font-sans">
      
      {/* Botões Superiores */}
      <div className="flex gap-4 mb-8 w-full max-w-[800px] md:max-w-full justify-center md:justify-start">
        <button onClick={() => setMostrarHistorico(!mostrarHistorico)} className={`px-6 py-2 rounded-lg border-2 transition-all font-bold text-xs tracking-wider ${mostrarHistorico ? "border-cyan-500 bg-cyan-500/20 text-white" : "border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>HISTÓRICO</button>
        <button onClick={() => setMostrarMaquinas(!mostrarMaquinas)} className={`px-6 py-2 rounded-lg border-2 transition-all font-bold text-xs tracking-wider ${mostrarMaquinas ? "border-cyan-500 bg-cyan-500/20 text-white" : "border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>MÁQUINAS</button>
      </div>

      <div className={`grid gap-6 transition-all duration-500 items-stretch justify-center w-full ${ (mostrarHistorico && mostrarMaquinas) ? "max-w-[1400px] md:grid-cols-4" : (mostrarHistorico || mostrarMaquinas) ? "max-w-[1100px] md:grid-cols-3" : "max-w-[750px] md:grid-cols-2" }`}>

        {/* 1. Entrada */}
        <div className="bg-zinc-900/40 rounded-2xl p-8 border border-zinc-800/50 shadow-xl flex flex-col min-h-[520px]">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg"><img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" /></div>
            <div><h1 className="text-xl font-bold text-cyan-500 leading-tight">Calculadora</h1><p className="text-zinc-500 text-[10px] uppercase tracking-widest">AlexandreCred</p></div>
          </div>
          <div className="space-y-4 flex-grow">
            <select className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-cyan-500 outline-none" value={tipo} onChange={e => setTipo(e.target.value as Tipo)}>
              <option value="tipo1">VISA/MASTER</option>
              <option value="tipo2">ELO/HIPER</option>
            </select>
            <select className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-cyan-500 outline-none" value={opcao} onChange={e => setOpcao(e.target.value as Opcao)}>
              <option value="liberado">Liberado</option>
              <option value="limite">Limite</option>
            </select>
            <input type="number" className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-cyan-500 outline-none" value={valor} onChange={e => setValor(e.target.value)} placeholder="Valor R$" />
            <select className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-cyan-500 outline-none" value={parcelas} onChange={e => setParcelas(Number(e.target.value))}>
              {Array.from({ length: 22 }).map((_, i) => <option key={i} value={i}>{i}x</option>)}
            </select>
            <button className="w-full bg-cyan-500 hover:bg-cyan-400 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95" onClick={calcular}>Calcular</button>
          </div>
        </div>

        {/* 2. Resultado */}
        <div className="bg-zinc-900/40 rounded-2xl p-8 border border-zinc-800/50 shadow-xl flex flex-col justify-between min-h-[520px]">
          <div>
            <h2 className="text-xl font-bold text-cyan-500 mb-6 uppercase tracking-widest">Resultado</h2>
            {res ? (
              <div className="space-y-4 text-zinc-400">
                <p className="flex justify-between border-b border-zinc-800/40 pb-2">Cartão: <span className="text-white font-bold">{tipo === "tipo1" ? "VISA/MASTER" : "ELO/HIPER"}</span></p>
                <p className="flex justify-between border-b border-zinc-800/40 pb-2">Valor Liberado: <span className="text-white font-bold">R$ {formatar(res.valorLiberado)}</span></p>
                <p className="flex justify-between border-b border-zinc-800/40 pb-2">Prazo: <span className="text-white font-bold">{parcelas}x</span></p>
                <p className="flex justify-between border-b border-zinc-800/40 pb-2">Parcela: <span className="text-white font-bold">R$ {res.parcela ? formatar(res.parcela) : '-'}</span></p>
                <div className="pt-8 text-center">
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Total a pagar</p>
                  <p className="text-4xl font-black text-white">R$ {formatar(res.totalPagar)}</p>
                </div>
              </div>
            ) : <div className="flex items-center justify-center h-48 italic text-zinc-600">Aguardando dados...</div>}
          </div>
          {res && <button onClick={handleCopiar} className="w-full border border-dashed border-cyan-500/50 text-cyan-500 py-3 rounded-xl font-bold uppercase text-[10px]">Copiar Resultado</button>}
        </div>

        {/* 3. Histórico */}
        {mostrarHistorico && (
          <div className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800/50 min-h-[520px] animate-in fade-in slide-in-from-right-4">
            <h2 className="text-lg font-bold text-cyan-500 mb-6 uppercase tracking-widest">Histórico</h2>
            <div className="space-y-6">
              {historico.map((item, index) => (
                <div key={index} className="border border-zinc-800 rounded-xl p-4 bg-black/40 text-[10px] space-y-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-cyan-500/10 px-2 py-1 text-[8px] text-cyan-500 font-bold rounded-bl-lg">#{index + 1}</div>
                   
                   <div className="mb-2">
                     <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[8px] font-bold border border-green-500/30 uppercase tracking-tighter">
                        Usou: {getMaquinaRecomendada(item.tipo, item.parcelas)}
                     </span>
                   </div>

                   <p className="flex justify-between border-b border-zinc-800/30 pb-1 text-zinc-400">Cartão: <span className="text-white font-bold">{item.tipo === "tipo1" ? "VISA/MASTER" : "ELO/HIPER"}</span></p>
                   <p className="flex justify-between border-b border-zinc-800/30 pb-1 text-zinc-400">Valor Liberado: <span className="text-white font-bold">R$ {formatar(item.resultado.valorLiberado)}</span></p>
                   <p className="flex justify-between border-b border-zinc-800/30 pb-1 text-zinc-400">Prazo: <span className="text-white font-bold">{item.parcelas}x</span></p>
                   <p className="flex justify-between border-b border-zinc-800/30 pb-1 text-zinc-400">Parcela: <span className="text-white font-bold">R$ {item.resultado.parcela ? formatar(item.resultado.parcela) : '-'}</span></p>
                   <p className="text-white font-black pt-2 text-right text-xs">Total: R$ {formatar(item.resultado.totalPagar)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Máquinas */}
        {mostrarMaquinas && (
          <div className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800/50 min-h-[520px] animate-in fade-in slide-in-from-right-4">
            <h2 className="text-lg font-bold text-cyan-500 mb-6 uppercase tracking-widest text-center">Máquinas</h2>
            <div className="space-y-3">
              
              {/* Máquina 1 - PAG BANK */}
              <div className={`p-3 rounded-xl border-2 transition-all flex flex-col gap-2 ${isM1 ? "border-green-500 bg-green-500/10" : "border-zinc-800 opacity-30"}`}>
                <p className="text-[10px] font-black text-center text-zinc-300 uppercase">Pag Bank</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 overflow-hidden shadow-lg"><img src="/maquina1.png" className="w-full h-full object-contain" alt="m1"/></div>
                  <div className="text-[9px]">
                     <p className="font-bold text-white uppercase tracking-tighter">Visa/Master: 0-8x</p>
                     {isM1 && <p className="text-green-400 font-bold mt-1 animate-pulse">✓ INDICADA</p>}
                  </div>
                </div>
              </div>

              {/* Máquina 2 - INFINITY */}
              <div className={`p-3 rounded-xl border-2 transition-all flex flex-col gap-2 ${isM2 ? "border-green-500 bg-green-500/10" : "border-zinc-800 opacity-30"}`}>
                <p className="text-[10px] font-black text-center text-zinc-300 uppercase">Infinity</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 overflow-hidden shadow-lg"><img src="/maquina2.png" className="w-full h-full object-contain" alt="m2"/></div>
                  <div className="text-[9px]">
                     <p className="font-bold text-white uppercase tracking-tighter">Visa/Master: 9-12x</p>
                     <p className="text-red-500 font-bold leading-tight">NÃO WILL / PAG</p>
                     {isM2 && <p className="text-green-400 font-bold mt-1 animate-pulse">✓ INDICADA</p>}
                  </div>
                </div>
              </div>

              {/* Máquina 3 - REDE */}
              <div className={`p-3 rounded-xl border-2 transition-all flex flex-col gap-2 ${isM3 ? "border-green-500 bg-green-500/10" : "border-zinc-800 opacity-30"}`}>
                <p className="text-[10px] font-black text-center text-zinc-300 uppercase">Rede</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 overflow-hidden shadow-lg"><img src="/maquina3.png" className="w-full h-full object-contain" alt="m3"/></div>
                  <div className="text-[9px]">
                     <p className="font-bold text-white uppercase tracking-tighter">Visa: 13-21x</p>
                     <p className="text-zinc-400">Elo: 5-21x</p>
                     {isM3 && <p className="text-green-400 font-bold mt-1 animate-pulse">✓ INDICADA</p>}
                  </div>
                </div>
              </div>

              {/* Máquina 4 - MERCADO PAGO */}
              <div className={`p-3 rounded-xl border-2 transition-all flex flex-col gap-2 ${isM4 ? "border-green-500 bg-green-500/10" : "border-zinc-800 opacity-30"}`}>
                <p className="text-[10px] font-black text-center text-zinc-300 uppercase">Mercado Pago</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 overflow-hidden shadow-lg"><img src="/maquina4.png" className="w-full h-full object-contain" alt="m4"/></div>
                  <div className="text-[9px]">
                     <p className="font-bold text-white uppercase tracking-tighter">Elo: 0-4x</p>
                     {isM4 && <p className="text-green-400 font-bold mt-1 animate-pulse">✓ INDICADA</p>}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
