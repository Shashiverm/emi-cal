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

/**
 * SSY (Sukanya Samriddhi Yojana) Calculator
 * Deposits for 15 years, account matures after 21 years
 * Current Sovereign Rate: 8.2% p.a. compounded annually
 */
export function calculateSSY(annualDeposit, rate = 8.2) {
  const depositTenure = 15;
  const maturityTenure = 21;
  let balance = 0;
  let totalInvested = 0;
  const yearlySchedule = [];

  for (let year = 1; year <= maturityTenure; year++) {
    const deposit = year <= depositTenure ? annualDeposit : 0;
    totalInvested += deposit;
    balance += deposit;
    const interest = Math.round(balance * (rate / 100));
    balance += interest;

    yearlySchedule.push({
      year,
      deposit,
      interestEarned: interest,
      totalDeposit: totalInvested,
      closingBalance: balance,
    });
  }

  return {
    totalInvested: Math.round(totalInvested),
    totalInterest: Math.round(balance - totalInvested),
    maturityValue: Math.round(balance),
    rate,
    schedule: yearlySchedule,
  };
}

/**
 * Senior Citizen Savings Scheme (SCSS)
 * 5-year lock-in with quarterly interest payout at 8.2% p.a.
 */
export function calculateSCSS(deposit, rate = 8.2) {
  const quarterlyRate = rate / 4 / 100;
  const quarterlyIncome = Math.round(deposit * quarterlyRate);
  const annualIncome = quarterlyIncome * 4;
  const totalInterest = annualIncome * 5;

  return {
    deposit,
    quarterlyIncome,
    annualIncome,
    totalInterest,
    maturityAmount: deposit,
    rate,
    tenureYears: 5,
  };
}

/**
 * Post Office Monthly Income Scheme (POMIS)
 * 5-year tenure with monthly payout at 7.4% p.a.
 */
export function calculatePOMIS(deposit, rate = 7.4) {
  const monthlyRate = rate / 12 / 100;
  const monthlyIncome = Math.round(deposit * monthlyRate);
  const annualIncome = monthlyIncome * 12;
  const totalInterest = monthlyIncome * 60;

  return {
    deposit,
    monthlyIncome,
    annualIncome,
    totalInterest,
    maturityAmount: deposit,
    rate,
    tenureYears: 5,
  };
}

/**
 * Atal Pension Yojana (APY)
 * Monthly contribution matrix for age 18 to 40 targeting ₹1k - ₹5k pension
 */
export function calculateAPY(entryAge, targetPension = 5000) {
  // Approximate official contribution chart for ₹5,000 pension per month
  const baseMap5k = {
    18: 210, 19: 228, 20: 248, 21: 269, 22: 292, 23: 318, 24: 346,
    25: 376, 26: 409, 27: 446, 28: 485, 29: 529, 30: 577, 31: 630,
    32: 689, 33: 752, 34: 824, 35: 902, 36: 990, 37: 1087, 38: 1196,
    39: 1318, 40: 1454
  };
  const factor = targetPension / 5000;
  const age = Math.min(40, Math.max(18, entryAge));
  const base5k = baseMap5k[age] || 210;
  const monthlyContribution = Math.round(base5k * factor);
  const investmentYears = 60 - age;
  const totalInvested = monthlyContribution * investmentYears * 12;
  const corpusAt60 = Math.round(targetPension * 170); // estimated corpus to sustain guaranteed annuity

  return {
    entryAge: age,
    targetPension,
    monthlyContribution,
    quarterlyContribution: monthlyContribution * 3,
    halfYearlyContribution: monthlyContribution * 6,
    investmentYears,
    totalInvested,
    corpusAt60,
  };
}

/**
 * Loan Eligibility & FOIR Calculator
 */
export function calculateLoanEligibility(grossMonthlyIncome, existingEMI = 0, annualRate = 8.5, tenureYears = 20, foirPercent = 50) {
  const maxAllowableEMI = Math.max(0, (grossMonthlyIncome * (foirPercent / 100)) - existingEMI);
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  // Principal = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
  let maxLoan = 0;
  if (r > 0 && maxAllowableEMI > 0) {
    maxLoan = (maxAllowableEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
  }
  return {
    grossMonthlyIncome,
    existingEMI,
    foirPercent,
    maxAllowableEMI: Math.round(maxAllowableEMI),
    maxLoanAmount: Math.round(maxLoan),
    tenureYears,
    annualRate,
  };
}

/**
 * Education Loan EMI with Moratorium Period
 */
export function calculateEducationLoan(loanAmount, annualRate = 9.5, courseTenureYears = 4, gracePeriodMonths = 12, repaymentYears = 10, payInterestDuringStudy = false) {
  const moratoriumMonths = (courseTenureYears * 12) + gracePeriodMonths;
  const monthlyRate = annualRate / 12 / 100;
  let principalAtRepayment = loanAmount;
  let moratoriumInterestAccrued = 0;

  if (payInterestDuringStudy) {
    moratoriumInterestAccrued = Math.round(loanAmount * monthlyRate * moratoriumMonths);
    principalAtRepayment = loanAmount;
  } else {
    // Simple interest compounded/capitalized at repayment start
    moratoriumInterestAccrued = Math.round(loanAmount * monthlyRate * moratoriumMonths);
    principalAtRepayment = loanAmount + moratoriumInterestAccrued;
  }

  const emi = calculateEMI(principalAtRepayment, annualRate, repaymentYears * 12);
  const totalRepaid = emi * repaymentYears * 12;
  const totalRepaymentInterest = totalRepaid - principalAtRepayment;
  const totalInterestOverall = payInterestDuringStudy ? (moratoriumInterestAccrued + totalRepaymentInterest) : (totalRepaid - loanAmount);

  return {
    initialLoan: loanAmount,
    moratoriumMonths,
    moratoriumInterestAccrued,
    repaymentPrincipal: principalAtRepayment,
    emi,
    repaymentYears,
    totalRepaidOverall: totalRepaid + (payInterestDuringStudy ? moratoriumInterestAccrued : 0),
    totalInterestOverall,
    taxDeduction80E: totalRepaymentInterest, // 100% interest deductible under Section 80E for 8 years
  };
}

/**
 * Rent vs Buy Multi-Decade Wealth Simulator
 */
export function calculateRentVsBuy({
  propertyPrice = 7500000,
  downPaymentPercent = 20,
  loanRate = 8.5,
  loanTenureYears = 20,
  monthlyRent = 25000,
  rentInflation = 6,
  propertyAppreciation = 7,
  equityReturnRate = 12,
  simulationYears = 15,
  annualMaintenancePercent = 1,
}) {
  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  const emi = calculateEMI(loanAmount, loanRate, loanTenureYears * 12);
  const annualLoanPayment = emi * 12;

  // Buying Track
  let homeValue = propertyPrice;
  let totalBuyingCashOutflow = downPayment;
  const rLoan = loanRate / 12 / 100;
  let loanBalance = loanAmount;

  // Renting Track
  // Rent savings track: invests the downpayment initial capital in equity mutual funds
  let renterPortfolio = downPayment;
  let currentRent = monthlyRent;
  let totalRentPaid = 0;

  for (let year = 1; year <= simulationYears; year++) {
    // Buy track updates
    homeValue *= (1 + propertyAppreciation / 100);
    const maintenance = homeValue * (annualMaintenancePercent / 100);
    const currentYearEMI = year <= loanTenureYears ? annualLoanPayment : 0;
    totalBuyingCashOutflow += currentYearEMI + maintenance;

    if (year <= loanTenureYears) {
      for (let m = 0; m < 12; m++) {
        const interest = loanBalance * rLoan;
        const principalPaid = emi - interest;
        loanBalance = Math.max(0, loanBalance - principalPaid);
      }
    }

    // Rent track updates
    const annualRent = currentRent * 12;
    totalRentPaid += annualRent;
    renterPortfolio *= (1 + equityReturnRate / 100);

    // Monthly difference between buyer outflow and renter outflow invested in equity
    const buyerAnnualOutflow = currentYearEMI + maintenance;
    const netSavings = buyerAnnualOutflow - annualRent;
    if (netSavings > 0) {
      renterPortfolio += netSavings; // renter saves and invests the difference
    } else {
      renterPortfolio += netSavings; // rent exceeded home ownership outflow
    }

    currentRent *= (1 + rentInflation / 100);
  }

  const buyerNetWorth = Math.round(homeValue - loanBalance);
  const renterNetWorth = Math.round(renterPortfolio);

  return {
    propertyPrice,
    downPayment: Math.round(downPayment),
    emi,
    homeFinalValue: Math.round(homeValue),
    buyerNetWorth,
    renterNetWorth,
    difference: Math.round(Math.abs(buyerNetWorth - renterNetWorth)),
    winner: buyerNetWorth >= renterNetWorth ? 'buy' : 'rent',
    totalRentPaid: Math.round(totalRentPaid),
    totalBuyingCashOutflow: Math.round(totalBuyingCashOutflow),
    simulationYears,
  };
}

/**
 * In-Hand Salary / CTC Breakdown Calculator
 */
export function calculateSalaryInHand(annualCTC, cityType = 'metro') {
  // Standard corporate salary structure breakdown
  const basicSalary = annualCTC * 0.45; // 45% of CTC
  const hra = cityType === 'metro' ? basicSalary * 0.50 : basicSalary * 0.40;
  const employerPF = Math.min(basicSalary * 0.12, 21600 * 12); // standard 12%
  const employeePF = employerPF;
  const gratuity = basicSalary * (15 / 26) / 12 * 12 * 0.0481;
  const specialAllowance = Math.max(0, annualCTC - basicSalary - hra - employerPF - gratuity);
  const professionalTax = 2400; // standard across Maharashtra, Karnataka, WB

  // Estimated New Regime Tax
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, annualCTC - employerPF - gratuity - standardDeduction);
  let annualTax = 0;

  if (taxableIncome <= 700000) {
    annualTax = 0; // Section 87A rebate
  } else {
    // 2024-25 / 2025-26 New Regime Slabs:
    // 0-3L: Nil, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
    if (taxableIncome > 1500000) annualTax += (taxableIncome - 1500000) * 0.30;
    if (taxableIncome > 1200000) annualTax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
    if (taxableIncome > 1000000) annualTax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
    if (taxableIncome > 700000) annualTax += Math.min(taxableIncome - 700000, 300000) * 0.10;
    if (taxableIncome > 300000) annualTax += Math.min(taxableIncome - 300000, 400000) * 0.05;
    annualTax = Math.round(annualTax * 1.04); // 4% cess
  }

  const grossSalary = basicSalary + hra + specialAllowance;
  const totalDeductions = employeePF + professionalTax + annualTax;
  const annualInHand = Math.max(0, grossSalary - totalDeductions);
  const monthlyInHand = Math.round(annualInHand / 12);

  return {
    annualCTC,
    monthlyGross: Math.round(grossSalary / 12),
    monthlyInHand,
    annualInHand: Math.round(annualInHand),
    basicSalary: Math.round(basicSalary),
    hra: Math.round(hra),
    specialAllowance: Math.round(specialAllowance),
    employeePF: Math.round(employeePF),
    employerPF: Math.round(employerPF),
    gratuity: Math.round(gratuity),
    professionalTax,
    estimatedAnnualTax: annualTax,
  };
}

/**
 * TDS (Tax Deducted at Source) Calculator
 */
export function calculateTDS(amount, sectionKey = '194J_tech', hasPAN = true) {
  const sections = {
    '194C_ind': { name: '194C - Contractor (Individual/HUF)', rate: 1, limit: 30000 },
    '194C_oth': { name: '194C - Contractor (Company/Firm)', rate: 2, limit: 30000 },
    '194J_tech': { name: '194J - Technical Fees / Call Centre', rate: 2, limit: 30000 },
    '194J_prof': { name: '194J - Professional Services / Royalty', rate: 10, limit: 30000 },
    '194I_land': { name: '194I - Rent for Land, Building, Furniture', rate: 10, limit: 240000 },
    '194I_plant': { name: '194I - Rent for Plant & Machinery', rate: 2, limit: 240000 },
    '194A_bank': { name: '194A - Bank Interest (Non-Senior)', rate: 10, limit: 40000 },
    '194H_comm': { name: '194H - Commission or Brokerage', rate: 5, limit: 15000 },
    '194Q_goods': { name: '194Q - Purchase of Goods > ₹50L', rate: 0.1, limit: 5000000 },
  };

  const sec = sections[sectionKey] || sections['194J_tech'];
  const applicableRate = !hasPAN ? 20 : (amount > sec.limit ? sec.rate : 0);
  const tdsAmount = Math.round(amount * (applicableRate / 100));
  const netPayable = amount - tdsAmount;

  return {
    amount,
    sectionName: sec.name,
    standardRate: sec.rate,
    applicableRate,
    thresholdLimit: sec.limit,
    tdsAmount,
    netPayable,
    hasPAN,
  };
}

/**
 * Capital Gains Tax Calculator (Union Budget 2024-25 & 2025-26 Rules)
 */
export function calculateCapitalGains({
  assetType = 'equity_listed',
  buyPrice = 200000,
  sellPrice = 500000,
  holdingMonths = 24,
  transferExpenses = 0,
}) {
  const netSaleConsideration = sellPrice - transferExpenses;
  const rawGain = netSaleConsideration - buyPrice;

  let isLTCG = false;
  let taxRate = 0;
  let taxAmount = 0;
  let exemptionAllowed = 0;

  if (assetType === 'equity_listed' || assetType === 'equity_mutual_fund') {
    isLTCG = holdingMonths > 12;
    if (isLTCG) {
      taxRate = 12.5; // Budget 2024 revised rate from 10% to 12.5%
      exemptionAllowed = Math.min(Math.max(0, rawGain), 125000); // Enhanced from 1L to 1.25L
      const taxableGain = Math.max(0, rawGain - exemptionAllowed);
      taxAmount = Math.round(taxableGain * 0.125 * 1.04);
    } else {
      taxRate = 20.0; // Budget 2024 revised STCG from 15% to 20%
      taxAmount = Math.round(Math.max(0, rawGain) * 0.20 * 1.04);
    }
  } else if (assetType === 'real_estate') {
    isLTCG = holdingMonths > 24;
    if (isLTCG) {
      taxRate = 12.5; // 12.5% without indexation for assets bought after 2001
      taxAmount = Math.round(Math.max(0, rawGain) * 0.125 * 1.04);
    } else {
      taxRate = 30.0; // slab rate (assume top bracket 30%)
      taxAmount = Math.round(Math.max(0, rawGain) * 0.30 * 1.04);
    }
  } else {
    // Debt Mutual funds bought after April 1, 2023 taxed at slab rate regardless of holding
    taxRate = 30.0;
    taxAmount = Math.round(Math.max(0, rawGain) * 0.30 * 1.04);
  }

  return {
    rawGain: Math.round(rawGain),
    isLTCG,
    gainType: isLTCG ? 'Long Term Capital Gain (LTCG)' : 'Short Term Capital Gain (STCG)',
    taxRate,
    exemptionAllowed,
    taxAmount: Math.max(0, taxAmount),
    netInHand: Math.round(rawGain - Math.max(0, taxAmount)),
  };
}

/**
 * Stamp Duty & Registration Charges Calculator
 */
export function calculateStampDuty(propertyValue, state = 'maharashtra', buyerGender = 'male') {
  const stateRates = {
    maharashtra: { male: 6.0, female: 5.0, joint: 5.5, regCap: 30000, regRate: 1.0 },
    karnataka: { male: 5.0, female: 5.0, joint: 5.0, regCap: 0, regRate: 1.0 },
    delhi: { male: 6.0, female: 4.0, joint: 5.0, regCap: 0, regRate: 1.0 },
    uttar_pradesh: { male: 7.0, female: 6.0, joint: 6.5, regCap: 0, regRate: 1.0 },
    tamil_nadu: { male: 7.0, female: 7.0, joint: 7.0, regCap: 0, regRate: 4.0 },
    telangana: { male: 6.0, female: 6.0, joint: 6.0, regCap: 0, regRate: 0.5 },
    gujarat: { male: 4.9, female: 4.9, joint: 4.9, regCap: 0, regRate: 1.0 },
    west_bengal: { male: 6.0, female: 6.0, joint: 6.0, regCap: 0, regRate: 1.0 },
  };

  const current = stateRates[state] || stateRates.maharashtra;
  const stampRate = current[buyerGender] || current.male;
  const stampDuty = Math.round(propertyValue * (stampRate / 100));

  let registrationFee = Math.round(propertyValue * (current.regRate / 100));
  if (current.regCap > 0 && registrationFee > current.regCap) {
    registrationFee = current.regCap;
  }

  const totalCharges = stampDuty + registrationFee;

  return {
    propertyValue,
    state,
    buyerGender,
    stampDutyRate: stampRate,
    stampDutyAmount: stampDuty,
    registrationRate: current.regRate,
    registrationFee,
    totalCharges,
  };
}

/**
 * Loan Prepayment & Savings Simulator
 * Simulates how extra prepayments shorten tenure and save interest
 */
export function calculateLoanPrepayment(principal, annualRate, tenureMonths, extraMonthly = 0, annualLumpSum = 0) {
  const normalEmi = calculateEMI(principal, annualRate, tenureMonths);
  const r = annualRate / 12 / 100;

  // Normal loan total interest
  let normalBalance = principal;
  let normalTotalInterest = 0;
  for (let m = 1; m <= tenureMonths; m++) {
    const interest = normalBalance * r;
    const pPaid = normalEmi - interest;
    normalTotalInterest += interest;
    normalBalance = Math.max(0, normalBalance - pPaid);
  }

  // Prepayment simulation
  let balance = principal;
  let prepaidInterest = 0;
  let actualMonths = 0;

  while (balance > 0 && actualMonths < tenureMonths * 2) {
    actualMonths++;
    const monthlyInterest = balance * r;
    let principalComponent = normalEmi - monthlyInterest;

    // Add extra monthly payment
    principalComponent += extraMonthly;

    // Add annual lumpsum if month is multiple of 12
    if (actualMonths % 12 === 0) {
      principalComponent += annualLumpSum;
    }

    prepaidInterest += monthlyInterest;
    balance = Math.max(0, balance - principalComponent);
  }

  const monthsSaved = Math.max(0, tenureMonths - actualMonths);
  const interestSaved = Math.max(0, normalTotalInterest - prepaidInterest);

  return {
    originalTenureMonths: tenureMonths,
    newTenureMonths: actualMonths,
    monthsSaved,
    yearsSaved: (monthsSaved / 12).toFixed(1),
    normalTotalInterest: Math.round(normalTotalInterest),
    newTotalInterest: Math.round(prepaidInterest),
    interestSaved: Math.round(interestSaved),
  };
}

