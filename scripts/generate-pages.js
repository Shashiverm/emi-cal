// Generate remaining calculator pages
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'pages', 'calculators');

function fmt_fn() {
  return `function fmt(n){const s=Math.abs(Math.round(n)).toString();let f=s.length<=3?s:'';if(s.length>3){f=s.slice(-3);let r=s.slice(0,-3);while(r.length>2){f=r.slice(-2)+','+f;r=r.slice(0,-2);}if(r.length)f=r+','+f;}return '₹'+f;}`;
}

function syncFn(ids) {
  return ids.map(id => `(function(){const s=document.getElementById('${id}'),i=document.getElementById('${id}-input');s?.addEventListener('input',()=>{i.value=s.value;calc();});i?.addEventListener('input',()=>{let v=parseFloat(i.value);if(!isNaN(v)){v=Math.max(parseFloat(s.min),Math.min(parseFloat(s.max),v));s.value=String(v);}calc();});})()`).join(';');
}

function chartFn(canvasId, label1, label2, color1, color2) {
  return `const c=document.getElementById('${canvasId}');if(!c)return;if(chart)chart.destroy();chart=new Chart(c.getContext('2d'),{type:'doughnut',data:{labels:['${label1}','${label2}'],datasets:[{data:[d1,d2],backgroundColor:['${color1}','${color2}'],borderColor:['#0a0a0f','#0a0a0f'],borderWidth:3,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:true,cutout:'70%',plugins:{legend:{position:'bottom',labels:{color:'#9ca3af',padding:16,usePointStyle:true,font:{size:12}}},tooltip:{callbacks:{label:(c)=>\` \${c.label}: \${fmt(c.raw)}\`}}}}});`;
}

function loanCalc(slug, title, desc, keywords, calcName, cat, rateKey, defAmount, maxAmount, defRate, amountLabel, minLabel, maxLabel) {
  const prefix = slug.replace(/-/g,'').substring(0,4);
  return `---
import CalculatorLayout from '../../layouts/CalculatorLayout.astro';
import bankData from '../../data/bank-rates.json';
---
<CalculatorLayout title="${title}" description="${desc}" keywords="${keywords}" calculator="${calcName}" category="${cat}" categoryBadge="badge-loan">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="glass-card p-6 md:p-8 animate-fade-in">
      <h2 class="font-[var(--font-heading)] font-semibold text-xl mb-6">${calcName} Details</h2>
      <div class="mb-6"><div class="flex items-center justify-between mb-2"><label class="text-sm font-medium text-[var(--color-text-secondary)]">${amountLabel}</label><div class="flex items-center gap-1"><span class="text-[var(--color-text-muted)] text-sm">₹</span><input type="number" id="${prefix}-amount-input" class="num-input w-36 text-right" value="${defAmount}" min="10000" max="${maxAmount}" step="10000"/></div></div><input type="range" id="${prefix}-amount" min="10000" max="${maxAmount}" step="10000" value="${defAmount}"/><div class="flex justify-between text-xs text-[var(--color-text-muted)] mt-1"><span>${minLabel}</span><span>${maxLabel}</span></div></div>
      <div class="mb-6"><div class="flex items-center justify-between mb-2"><label class="text-sm font-medium text-[var(--color-text-secondary)]">Interest Rate (p.a.)</label><div class="flex items-center gap-1"><input type="number" id="${prefix}-rate-input" class="num-input w-24 text-right" value="${defRate}" min="1" max="30" step="0.1"/><span class="text-[var(--color-text-muted)] text-sm">%</span></div></div><input type="range" id="${prefix}-rate" min="1" max="30" step="0.1" value="${defRate}"/><div class="flex justify-between text-xs text-[var(--color-text-muted)] mt-1"><span>1%</span><span>30%</span></div></div>
      <div class="mb-6"><div class="flex items-center justify-between mb-2"><label class="text-sm font-medium text-[var(--color-text-secondary)]">Loan Tenure</label><div class="flex items-center gap-1"><input type="number" id="${prefix}-tenure-input" class="num-input w-20 text-right" value="5" min="1" max="30"/><span class="text-[var(--color-text-muted)] text-sm">Years</span></div></div><input type="range" id="${prefix}-tenure" min="1" max="30" step="1" value="5"/><div class="flex justify-between text-xs text-[var(--color-text-muted)] mt-1"><span>1 Yr</span><span>30 Yr</span></div></div>
    </div>
    <div class="flex flex-col gap-6 animate-fade-in-delay">
      <div class="glass-card p-6 md:p-8 animate-pulse-glow"><div class="text-sm text-[var(--color-text-muted)] mb-1">Monthly EMI</div><div id="${prefix}-emi" class="result-value gradient-text">₹0</div></div>
      <div class="grid grid-cols-3 gap-3">
        <div class="glass-card-static p-4"><div class="text-xs text-[var(--color-text-muted)] mb-1">Principal</div><div id="${prefix}-principal" class="font-[var(--font-mono)] font-bold text-base text-[var(--color-accent-cyan)]">₹0</div></div>
        <div class="glass-card-static p-4"><div class="text-xs text-[var(--color-text-muted)] mb-1">Interest</div><div id="${prefix}-interest" class="font-[var(--font-mono)] font-bold text-base text-[var(--color-accent-rose)]">₹0</div></div>
        <div class="glass-card-static p-4"><div class="text-xs text-[var(--color-text-muted)] mb-1">Total</div><div id="${prefix}-total" class="font-[var(--font-mono)] font-bold text-base text-[var(--color-text-primary)]">₹0</div></div>
      </div>
      <div class="glass-card-static p-6 flex justify-center"><div class="chart-container"><canvas id="${prefix}-chart"></canvas></div></div>
    </div>
  </div>
  <div class="mt-10 glass-card-static p-6 md:p-8">
    <h2 class="font-[var(--font-heading)] font-semibold text-xl mb-6">${calcName} — Bank Rates</h2>
    <div class="overflow-x-auto"><table class="bank-table"><thead><tr><th>Bank</th><th>Min Rate</th><th>Max Rate</th><th>Processing Fee</th></tr></thead><tbody>\${bankData.banks.map(b=>\`<tr><td class="font-medium text-[var(--color-text-primary)]"><span class="mr-2">\${b.logo}</span>\${b.shortName}</td><td class="font-[var(--font-mono)] text-sm text-[var(--color-accent-emerald)]">\${b.rates.${rateKey}.min}%</td><td class="font-[var(--font-mono)] text-sm text-[var(--color-accent-amber)]">\${b.rates.${rateKey}.max}%</td><td class="text-[var(--color-text-muted)] text-sm">\${b.rates.${rateKey}.processing}</td></tr>\`).join('')}</tbody></table></div>
  </div>
</CalculatorLayout>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js" defer></script>
<script>
  ${fmt_fn()}
  let chart=null;
  ${syncFn([`${prefix}-amount`,`${prefix}-rate`,`${prefix}-tenure`])}
  function calc(){const P=parseFloat(document.getElementById('${prefix}-amount-input').value)||0;const R=parseFloat(document.getElementById('${prefix}-rate-input').value)||0;const T=parseFloat(document.getElementById('${prefix}-tenure-input').value)||0;const n=T*12;const r=R/12/100;const emi=r>0?Math.round((P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1)):Math.round(P/n);const total=emi*n;const interest=total-P;
  document.getElementById('${prefix}-emi').textContent=fmt(emi);document.getElementById('${prefix}-principal').textContent=fmt(P);document.getElementById('${prefix}-interest').textContent=fmt(interest);document.getElementById('${prefix}-total').textContent=fmt(total);
  const d1=P,d2=interest;${chartFn(`${prefix}-chart`,'Principal','Interest','#06b6d4','#f43f5e')}}
  calc();
<\/script>`;
}

// Note: The Astro template syntax ${} conflicts with JS template literals for bank data.
// We need a different approach - write files directly.

const pages = [
  {
    file: 'car-loan-emi-calculator.astro',
    title: 'Car Loan EMI Calculator — Auto Loan Monthly Payment',
    desc: 'Calculate your car loan EMI instantly. Compare car loan rates across SBI, HDFC, ICICI, Axis and other banks.',
    keywords: 'car loan emi calculator, auto loan calculator, car loan interest rate, car loan emi, vehicle loan calculator',
    calcName: 'Car Loan EMI Calculator',
    rateKey: 'carLoan',
    defAmount: '800000', maxAmount: '10000000', defRate: '8.5',
    amountLabel: 'Car Loan Amount', minLabel: '₹10K', maxLabel: '₹1Cr',
    prefix: 'carl'
  },
  {
    file: 'bike-loan-emi-calculator.astro',
    title: 'Bike Loan EMI Calculator — Two Wheeler Loan',
    desc: 'Calculate your bike or two-wheeler loan EMI. Compare rates across Indian banks.',
    keywords: 'bike loan emi calculator, two wheeler loan, bike loan interest rate, bike emi calculator',
    calcName: 'Bike Loan EMI Calculator',
    rateKey: 'bikeLoan',
    defAmount: '100000', maxAmount: '1000000', defRate: '10.5',
    amountLabel: 'Bike Loan Amount', minLabel: '₹10K', maxLabel: '₹10L',
    prefix: 'bike'
  },
  {
    file: 'personal-loan-emi-calculator.astro',
    title: 'Personal Loan EMI Calculator — Instant Calculation',
    desc: 'Calculate personal loan EMI and total interest payable. Compare personal loan rates across major Indian banks.',
    keywords: 'personal loan emi calculator, personal loan interest rate, personal loan calculator, personal loan emi',
    calcName: 'Personal Loan EMI Calculator',
    rateKey: 'personalLoan',
    defAmount: '500000', maxAmount: '5000000', defRate: '10.5',
    amountLabel: 'Loan Amount', minLabel: '₹10K', maxLabel: '₹50L',
    prefix: 'pers'
  },
  {
    file: 'appliance-loan-emi-calculator.astro',
    title: 'Appliance Loan EMI Calculator — Consumer Durable Loan',
    desc: 'Calculate EMI for consumer durable and appliance loans. Check no-cost EMI and market rate options.',
    keywords: 'appliance loan emi, consumer durable loan, no cost emi calculator, appliance emi calculator',
    calcName: 'Appliance Loan EMI Calculator',
    rateKey: 'applianceLoan',
    defAmount: '50000', maxAmount: '500000', defRate: '12.0',
    amountLabel: 'Appliance Price', minLabel: '₹10K', maxLabel: '₹5L',
    prefix: 'appl'
  }
];

pages.forEach(p => {
  const content = `---
import CalculatorLayout from '../../layouts/CalculatorLayout.astro';
import bankData from '../../data/bank-rates.json';
---
<CalculatorLayout title="${p.title}" description="${p.desc}" keywords="${p.keywords}" calculator="${p.calcName}" category="Loan & EMI" categoryBadge="badge-loan">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="glass-card p-6 md:p-8 animate-fade-in">
      <h2 class="font-[var(--font-heading)] font-semibold text-xl mb-6">${p.calcName} Details</h2>
      <div class="mb-6"><div class="flex items-center justify-between mb-2"><label class="text-sm font-medium text-[var(--color-text-secondary)]">${p.amountLabel}</label><div class="flex items-center gap-1"><span class="text-[var(--color-text-muted)] text-sm">₹</span><input type="number" id="${p.prefix}-amount-input" class="num-input w-36 text-right" value="${p.defAmount}" min="10000" max="${p.maxAmount}" step="10000"/></div></div><input type="range" id="${p.prefix}-amount" min="10000" max="${p.maxAmount}" step="10000" value="${p.defAmount}"/><div class="flex justify-between text-xs text-[var(--color-text-muted)] mt-1"><span>${p.minLabel}</span><span>${p.maxLabel}</span></div></div>
      <div class="mb-6"><div class="flex items-center justify-between mb-2"><label class="text-sm font-medium text-[var(--color-text-secondary)]">Interest Rate (p.a.)</label><div class="flex items-center gap-1"><input type="number" id="${p.prefix}-rate-input" class="num-input w-24 text-right" value="${p.defRate}" min="1" max="30" step="0.1"/><span class="text-[var(--color-text-muted)] text-sm">%</span></div></div><input type="range" id="${p.prefix}-rate" min="1" max="30" step="0.1" value="${p.defRate}"/><div class="flex justify-between text-xs text-[var(--color-text-muted)] mt-1"><span>1%</span><span>30%</span></div></div>
      <div class="mb-6"><div class="flex items-center justify-between mb-2"><label class="text-sm font-medium text-[var(--color-text-secondary)]">Loan Tenure</label><div class="flex items-center gap-1"><input type="number" id="${p.prefix}-tenure-input" class="num-input w-20 text-right" value="5" min="1" max="15"/><span class="text-[var(--color-text-muted)] text-sm">Years</span></div></div><input type="range" id="${p.prefix}-tenure" min="1" max="15" step="1" value="5"/><div class="flex justify-between text-xs text-[var(--color-text-muted)] mt-1"><span>1 Yr</span><span>15 Yr</span></div></div>
    </div>
    <div class="flex flex-col gap-6 animate-fade-in-delay">
      <div class="glass-card p-6 md:p-8 animate-pulse-glow"><div class="text-sm text-[var(--color-text-muted)] mb-1">Monthly EMI</div><div id="${p.prefix}-emi" class="result-value gradient-text">₹0</div></div>
      <div class="grid grid-cols-3 gap-3">
        <div class="glass-card-static p-4"><div class="text-xs text-[var(--color-text-muted)] mb-1">Principal</div><div id="${p.prefix}-principal" class="font-[var(--font-mono)] font-bold text-base text-[var(--color-accent-cyan)]">₹0</div></div>
        <div class="glass-card-static p-4"><div class="text-xs text-[var(--color-text-muted)] mb-1">Interest</div><div id="${p.prefix}-interest" class="font-[var(--font-mono)] font-bold text-base text-[var(--color-accent-rose)]">₹0</div></div>
        <div class="glass-card-static p-4"><div class="text-xs text-[var(--color-text-muted)] mb-1">Total</div><div id="${p.prefix}-total" class="font-[var(--font-mono)] font-bold text-base text-[var(--color-text-primary)]">₹0</div></div>
      </div>
      <div class="glass-card-static p-6 flex justify-center"><div class="chart-container"><canvas id="${p.prefix}-chart"></canvas></div></div>
    </div>
  </div>
  <div class="mt-10 glass-card-static p-6 md:p-8">
    <h2 class="font-[var(--font-heading)] font-semibold text-xl mb-6">${p.calcName} — Bank Rates</h2>
    <div class="overflow-x-auto"><table class="bank-table"><thead><tr><th>Bank</th><th>Min Rate</th><th>Max Rate</th><th>Processing Fee</th></tr></thead>
      <tbody>{bankData.banks.map(b=><tr><td class="font-medium text-[var(--color-text-primary)]"><span class="mr-2">{b.logo}</span>{b.shortName}</td><td class="font-[var(--font-mono)] text-sm text-[var(--color-accent-emerald)]">{b.rates.${p.rateKey}.min}%</td><td class="font-[var(--font-mono)] text-sm text-[var(--color-accent-amber)]">{b.rates.${p.rateKey}.max}%</td><td class="text-[var(--color-text-muted)] text-sm">{b.rates.${p.rateKey}.processing}</td></tr>)}</tbody></table></div>
  </div>
</CalculatorLayout>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js" defer><\/script>
<script>
  function fmt(n){const s=Math.abs(Math.round(n)).toString();let f=s.length<=3?s:'';if(s.length>3){f=s.slice(-3);let r=s.slice(0,-3);while(r.length>2){f=r.slice(-2)+','+f;r=r.slice(0,-2);}if(r.length)f=r+','+f;}return '₹'+f;}
  let chart=null;
  ['${p.prefix}-amount','${p.prefix}-rate','${p.prefix}-tenure'].forEach(function(id){var s=document.getElementById(id),i=document.getElementById(id+'-input');s&&s.addEventListener('input',function(){i.value=s.value;calc();});i&&i.addEventListener('input',function(){var v=parseFloat(i.value);if(!isNaN(v)){v=Math.max(parseFloat(s.min),Math.min(parseFloat(s.max),v));s.value=String(v);}calc();});});
  function calc(){var P=parseFloat(document.getElementById('${p.prefix}-amount-input').value)||0;var R=parseFloat(document.getElementById('${p.prefix}-rate-input').value)||0;var T=parseFloat(document.getElementById('${p.prefix}-tenure-input').value)||0;var n=T*12;var r=R/12/100;var emi=r>0?Math.round((P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1)):Math.round(P/n);var total=emi*n;var interest=total-P;
  document.getElementById('${p.prefix}-emi').textContent=fmt(emi);document.getElementById('${p.prefix}-principal').textContent=fmt(P);document.getElementById('${p.prefix}-interest').textContent=fmt(interest);document.getElementById('${p.prefix}-total').textContent=fmt(total);
  var c=document.getElementById('${p.prefix}-chart');if(!c)return;if(chart)chart.destroy();chart=new Chart(c.getContext('2d'),{type:'doughnut',data:{labels:['Principal','Interest'],datasets:[{data:[P,interest],backgroundColor:['#06b6d4','#f43f5e'],borderColor:['#0a0a0f','#0a0a0f'],borderWidth:3,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:true,cutout:'70%',plugins:{legend:{position:'bottom',labels:{color:'#9ca3af',padding:16,usePointStyle:true,font:{size:12}}},tooltip:{callbacks:{label:function(c){return ' '+c.label+': '+fmt(c.raw);}}}}}});}
  calc();
<\/script>`;
  fs.writeFileSync(path.join(dir, p.file), content);
  console.log(`Created ${p.file}`);
});

console.log('Done generating loan calculator pages!');
