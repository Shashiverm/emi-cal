// =============================================
// FinCalc India — Financial Calculation Utilities
// =============================================

/**
 * EMI Calculation (Reducing Balance Method)
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * EMI Calculation (Flat Rate Method)
 * EMI = (P + (P × R × T)) / (T × 12)
 */
export function calculateFlatEMI(principal, annualRate, tenureYears) {
  const totalInterest = principal * (annualRate / 100) * tenureYears;
  const totalAmount = principal + totalInterest;
  const emi = totalAmount / (tenureYears * 12);
  return Math.round(emi);
}

/**
 * Generate Amortization Schedule (Reducing Balance)
 */
export function generateAmortization(principal, annualRate, tenureMonths) {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const r = annualRate / 12 / 100;
  let balance = principal;
  const schedule = [];
  let yearPrincipal = 0;
  let yearInterest = 0;

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = Math.round(balance * r);
    const principalPaid = emi - interestPaid;
    balance = Math.max(0, balance - principalPaid);
    yearPrincipal += principalPaid;
    yearInterest += interestPaid;

    if (month % 12 === 0 || month === tenureMonths) {
      schedule.push({
        year: Math.ceil(month / 12),
        principalPaid: Math.round(yearPrincipal),
        interestPaid: Math.round(yearInterest),
        totalPaid: Math.round(yearPrincipal + yearInterest),
        balance: Math.round(balance),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }
  return { emi, schedule };
}

/**
 * SIP Calculator
 * FV = P × [{(1+r)^n - 1} / r] × (1+r)
 */
export function calculateSIP(monthlyInvestment, expectedReturnRate, tenureYears) {
  const n = tenureYears * 12;
  const r = expectedReturnRate / 12 / 100;
  const futureValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = monthlyInvestment * n;
  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(futureValue - totalInvested),
  };
}

/**
 * Step-Up SIP Calculator (Annual increase)
 */
export function calculateStepUpSIP(monthlyInvestment, expectedReturnRate, tenureYears, annualStepUp) {
  const r = expectedReturnRate / 12 / 100;
  let totalInvested = 0;
  let futureValue = 0;
  let currentMonthly = monthlyInvestment;

  for (let year = 0; year < tenureYears; year++) {
    for (let month = 0; month < 12; month++) {
      const monthsRemaining = (tenureYears - year) * 12 - month;
      futureValue += currentMonthly * Math.pow(1 + r, monthsRemaining);
      totalInvested += currentMonthly;
    }
    currentMonthly = Math.round(currentMonthly * (1 + annualStepUp / 100));
  }

  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(futureValue - totalInvested),
  };
}

/**
 * Lumpsum Calculator
 * FV = P × (1+r)^n
 */
export function calculateLumpsum(investment, expectedReturnRate, tenureYears) {
  const futureValue = investment * Math.pow(1 + expectedReturnRate / 100, tenureYears);
  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(investment),
    totalReturns: Math.round(futureValue - investment),
  };
}

/**
 * SWP Calculator (Systematic Withdrawal Plan)
 */
export function calculateSWP(totalInvestment, withdrawalPerMonth, expectedReturnRate, tenureYears) {
  const r = expectedReturnRate / 12 / 100;
  const n = tenureYears * 12;
  let balance = totalInvestment;
  let totalWithdrawn = 0;

  for (let month = 1; month <= n; month++) {
    balance = balance * (1 + r) - withdrawalPerMonth;
    totalWithdrawn += withdrawalPerMonth;
    if (balance <= 0) {
      return {
        finalValue: 0,
        totalWithdrawn: Math.round(totalWithdrawn - Math.abs(balance)),
        totalInvested: totalInvestment,
      };
    }
  }
  return {
    finalValue: Math.round(balance),
    totalWithdrawn: Math.round(totalWithdrawn),
    totalInvested: totalInvestment,
  };
}

/**
 * FD Calculator (Fixed Deposit)
 * With quarterly compounding: A = P × (1 + r/4)^(4×t)
 */
export function calculateFD(principal, annualRate, tenureYears, compoundingFrequency = 4) {
  const r = annualRate / 100;
  const maturityAmount = principal * Math.pow(1 + r / compoundingFrequency, compoundingFrequency * tenureYears);
  return {
    maturityAmount: Math.round(maturityAmount),
    totalInterest: Math.round(maturityAmount - principal),
    principal: Math.round(principal),
  };
}

/**
 * RD Calculator (Recurring Deposit)
 * Uses quarterly compounding formula for RD
 */
export function calculateRD(monthlyDeposit, annualRate, tenureMonths) {
  const r = annualRate / 100;
  const n = 4; // quarterly compounding
  let maturity = 0;

  for (let i = 0; i < tenureMonths; i++) {
    const monthsRemaining = tenureMonths - i;
    const quartersRemaining = monthsRemaining / 3;
    maturity += monthlyDeposit * Math.pow(1 + r / n, quartersRemaining);
  }

  const totalDeposited = monthlyDeposit * tenureMonths;
  return {
    maturityAmount: Math.round(maturity),
    totalDeposited: Math.round(totalDeposited),
    totalInterest: Math.round(maturity - totalDeposited),
  };
}

/**
 * PPF Calculator (Public Provident Fund)
 * 15-year tenure, annual compounding, govt rate
 */
export function calculatePPF(yearlyInvestment, annualRate, tenureYears = 15) {
  const r = annualRate / 100;
  let balance = 0;
  const yearWise = [];

  for (let year = 1; year <= tenureYears; year++) {
    balance = (balance + yearlyInvestment) * (1 + r);
    yearWise.push({
      year,
      deposit: yearlyInvestment,
      interest: Math.round(balance - yearlyInvestment * year),
      balance: Math.round(balance),
    });
  }

  const totalInvested = yearlyInvestment * tenureYears;
  return {
    maturityAmount: Math.round(balance),
    totalInvested,
    totalInterest: Math.round(balance - totalInvested),
    yearWise,
  };
}

/**
 * EPF Calculator (Employee Provident Fund)
 */
export function calculateEPF(monthlySalary, employeeContribution, employerContribution, annualRate, tenureYears) {
  const r = annualRate / 12 / 100;
  const employeeMonthly = monthlySalary * (employeeContribution / 100);
  const employerMonthly = monthlySalary * (employerContribution / 100);
  const totalMonthly = employeeMonthly + employerMonthly;
  let balance = 0;

  for (let month = 1; month <= tenureYears * 12; month++) {
    balance = (balance + totalMonthly) * (1 + r);
  }

  return {
    maturityAmount: Math.round(balance),
    totalEmployeeContribution: Math.round(employeeMonthly * tenureYears * 12),
    totalEmployerContribution: Math.round(employerMonthly * tenureYears * 12),
    totalInterest: Math.round(balance - totalMonthly * tenureYears * 12),
  };
}

/**
 * NPS Calculator (National Pension System)
 */
export function calculateNPS(monthlyInvestment, expectedReturnRate, currentAge, retirementAge) {
  const tenureYears = retirementAge - currentAge;
  const n = tenureYears * 12;
  const r = expectedReturnRate / 12 / 100;
  const futureValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = monthlyInvestment * n;

  return {
    totalCorpus: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(futureValue - totalInvested),
    annuityValue: Math.round(futureValue * 0.4),
    lumpsum: Math.round(futureValue * 0.6),
  };
}

/**
 * Retirement Calculator
 */
export function calculateRetirement(currentAge, retirementAge, monthlyExpenses, inflationRate, expectedReturnRate, lifeExpectancy = 85) {
  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;

  // Future monthly expenses at retirement
  const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

  // Corpus needed at retirement (considering inflation during retirement)
  const realReturnRate = ((1 + expectedReturnRate / 100) / (1 + inflationRate / 100)) - 1;
  const monthlyRealReturn = realReturnRate / 12;
  const retirementMonths = yearsInRetirement * 12;

  let corpusNeeded;
  if (monthlyRealReturn === 0) {
    corpusNeeded = futureMonthlyExpenses * retirementMonths;
  } else {
    corpusNeeded = futureMonthlyExpenses * ((1 - Math.pow(1 + monthlyRealReturn, -retirementMonths)) / monthlyRealReturn);
  }

  // Monthly savings needed
  const monthlyReturn = expectedReturnRate / 12 / 100;
  const savingsMonths = yearsToRetirement * 12;
  const monthlySavings = corpusNeeded / (((Math.pow(1 + monthlyReturn, savingsMonths) - 1) / monthlyReturn) * (1 + monthlyReturn));

  return {
    corpusNeeded: Math.round(corpusNeeded),
    monthlySavings: Math.round(monthlySavings),
    futureMonthlyExpenses: Math.round(futureMonthlyExpenses),
    yearsToRetirement,
    yearsInRetirement,
  };
}

/**
 * Gratuity Calculator
 * Gratuity = (15 × Last Drawn Salary × Years of Service) / 26
 */
export function calculateGratuity(lastDrawnSalary, yearsOfService) {
  const gratuity = (15 * lastDrawnSalary * yearsOfService) / 26;
  return Math.round(gratuity);
}

/**
 * Income Tax Calculator (India FY 2025-26)
 */
export function calculateIncomeTax(grossIncome, deductions80C = 0, deductions80D = 0, hra = 0, otherDeductions = 0) {
  // New Regime (No deductions, lower rates)
  const newRegimeSlabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 5 },
    { limit: 1200000, rate: 10 },
    { limit: 1600000, rate: 15 },
    { limit: 2000000, rate: 20 },
    { limit: 2400000, rate: 25 },
    { limit: Infinity, rate: 30 },
  ];

  // Old Regime
  const oldRegimeSlabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 5 },
    { limit: 1000000, rate: 20 },
    { limit: Infinity, rate: 30 },
  ];

  function calcTax(income, slabs) {
    let tax = 0;
    let prev = 0;
    for (const slab of slabs) {
      if (income <= prev) break;
      const taxable = Math.min(income, slab.limit) - prev;
      tax += taxable * (slab.rate / 100);
      prev = slab.limit;
    }
    // Add cess 4%
    tax += tax * 0.04;
    return Math.round(tax);
  }

  const newRegimeTax = calcTax(grossIncome - 75000, newRegimeSlabs); // standard deduction
  const totalOldDeductions = Math.min(deductions80C, 150000) + deductions80D + hra + otherDeductions + 50000; // 50k std deduction
  const oldRegimeTax = calcTax(grossIncome - totalOldDeductions, oldRegimeSlabs);

  return {
    newRegimeTax,
    oldRegimeTax,
    savings: Math.abs(newRegimeTax - oldRegimeTax),
    betterRegime: newRegimeTax <= oldRegimeTax ? 'New Regime' : 'Old Regime',
  };
}

/**
 * HRA Calculator
 */
export function calculateHRA(basicSalary, hra, rentPaid, isMetro) {
  const annualBasic = basicSalary * 12;
  const annualHRA = hra * 12;
  const annualRent = rentPaid * 12;

  const a = annualHRA;
  const b = annualRent - (0.1 * annualBasic);
  const c = isMetro ? 0.5 * annualBasic : 0.4 * annualBasic;

  const exempt = Math.max(0, Math.min(a, b, c));
  const taxable = annualHRA - exempt;

  return {
    exempt: Math.round(exempt),
    taxable: Math.round(taxable),
    monthlyExempt: Math.round(exempt / 12),
  };
}

/**
 * GST Calculator
 */
export function calculateGST(amount, gstRate, isInclusive) {
  if (isInclusive) {
    const originalPrice = amount / (1 + gstRate / 100);
    const gstAmount = amount - originalPrice;
    return {
      originalPrice: Math.round(originalPrice * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalPrice: amount,
      cgst: Math.round(gstAmount / 2 * 100) / 100,
      sgst: Math.round(gstAmount / 2 * 100) / 100,
    };
  } else {
    const gstAmount = amount * (gstRate / 100);
    const totalPrice = amount + gstAmount;
    return {
      originalPrice: amount,
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      cgst: Math.round(gstAmount / 2 * 100) / 100,
      sgst: Math.round(gstAmount / 2 * 100) / 100,
    };
  }
}

/**
 * Simple Interest Calculator
 * SI = P × R × T / 100
 */
export function calculateSimpleInterest(principal, annualRate, tenureYears) {
  const interest = (principal * annualRate * tenureYears) / 100;
  return {
    interest: Math.round(interest),
    totalAmount: Math.round(principal + interest),
    principal,
  };
}

/**
 * Compound Interest Calculator
 * A = P × (1 + r/n)^(n×t)
 */
export function calculateCompoundInterest(principal, annualRate, tenureYears, compoundingFrequency = 12) {
  const totalAmount = principal * Math.pow(1 + annualRate / 100 / compoundingFrequency, compoundingFrequency * tenureYears);
  return {
    totalAmount: Math.round(totalAmount),
    interest: Math.round(totalAmount - principal),
    principal,
  };
}

/**
 * CAGR Calculator
 * CAGR = (Ending Value / Beginning Value)^(1/n) - 1
 */
export function calculateCAGR(beginningValue, endingValue, tenureYears) {
  const cagr = (Math.pow(endingValue / beginningValue, 1 / tenureYears) - 1) * 100;
  return {
    cagr: Math.round(cagr * 100) / 100,
    absoluteReturn: Math.round((endingValue - beginningValue) / beginningValue * 100 * 100) / 100,
  };
}

/**
 * Inflation Calculator
 */
export function calculateInflation(currentCost, inflationRate, tenureYears) {
  const futureCost = currentCost * Math.pow(1 + inflationRate / 100, tenureYears);
  return {
    futureCost: Math.round(futureCost),
    costIncrease: Math.round(futureCost - currentCost),
    currentCost,
  };
}

/**
 * Format currency (Indian numbering system)
 */
export function formatCurrency(num) {
  if (num === undefined || num === null || isNaN(num)) return '₹0';
  const isNeg = num < 0;
  num = Math.abs(Math.round(num));
  const str = num.toString();
  let formatted = '';
  if (str.length <= 3) {
    formatted = str;
  } else {
    formatted = str.slice(-3);
    let remaining = str.slice(0, -3);
    while (remaining.length > 2) {
      formatted = remaining.slice(-2) + ',' + formatted;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      formatted = remaining + ',' + formatted;
    }
  }
  return (isNeg ? '-' : '') + '₹' + formatted;
}

/**
 * Format number in short form (Lakhs, Crores)
 */
export function formatShort(num) {
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return '₹' + (num / 100000).toFixed(2) + ' L';
  if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + ' K';
  return '₹' + num;
}
