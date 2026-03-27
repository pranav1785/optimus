export const TOWNS = [
  {
    id: 1, name: "Money Basics", description: "Inflation, interest rates, and why investing matters",
    icon: "Coins", color: "#6C63FF", bgGrad: "from-indigo-900/40 to-purple-900/40",
    requiredXP: 0, xpReward: 500, badgeName: "Money Mind",
    lessons: [
      { id: "1-1", title: "What is Inflation?", duration: "5 min", xpReward: 50,
        content: `**Inflation** is the rate at which prices of goods and services rise over time, reducing your purchasing power.\n\nIf inflation is 6% per year, something that costs ₹100 today will cost ₹106 next year. Your ₹100 sitting in a locker will buy LESS next year.\n\n**Key insight**: India's average inflation has been 5-7% annually. A savings account paying 4% interest means you're actually LOSING 1-3% in real value every year!\n\n**RBI's role**: The Reserve Bank of India targets 4% inflation (with 2-6% tolerance band) by adjusting interest rates.\n\n*Example*: In 2009, ₹100 could buy ~1kg tomatoes. In 2024, the same ₹100 buys much less. That's inflation at work.`,
        terms: ["inflation", "purchasing power", "RBI", "CPI"]
      },
      { id: "1-2", title: "Compound Interest — The 8th Wonder", duration: "7 min", xpReward: 75,
        content: `Albert Einstein called compound interest "the 8th wonder of the world." Here's why.\n\n**Simple Interest**: ₹10,000 at 10% for 3 years = ₹3,000 interest\n**Compound Interest**: ₹10,000 at 10% compounded annually for 3 years = ₹3,310 interest\n\nThe difference? In compound interest, you earn **interest on your interest**.\n\n**Rule of 72**: Divide 72 by the interest rate to find how many years to double your money.\n- At 12% return: 72/12 = 6 years to double\n- At 6% return: 72/6 = 12 years to double\n\n**Example**: ₹1 Lakh invested at 12% for 30 years = **₹29.96 Lakhs!** Without investing, it stays ₹1 Lakh. This is the power of compound interest.`,
        terms: ["compound interest", "simple interest", "Rule of 72"]
      },
      { id: "1-3", title: "Time Value of Money", duration: "8 min", xpReward: 100,
        content: `**Core principle**: ₹100 today is worth MORE than ₹100 a year from now.\n\nWhy? Because:\n1. You can invest ₹100 today and earn returns\n2. Inflation erodes purchasing power\n3. Future cash flows carry uncertainty\n\n**Present Value (PV)**: What a future sum is worth TODAY\n**Future Value (FV)**: What today's money will be worth in the FUTURE\n\n**Formula**: FV = PV × (1 + r)^n\n- PV = Present Value\n- r = interest rate per period\n- n = number of periods\n\n**Example**: ₹1,000 today at 8% return:\n- Year 1: ₹1,080\n- Year 5: ₹1,469\n- Year 10: ₹2,159\n\n**Application**: This is why starting investing early matters SO much. A 22-year-old investing ₹5,000/month will have FAR more at 60 than a 35-year-old investing the same amount.`,
        terms: ["time value of money", "present value", "future value", "discount rate"]
      },
    ],
    quiz: [
      { q: "If inflation is 6% and your FD pays 5%, what happens to your purchasing power?", options: ["Increases by 1%", "Decreases by 1%", "Stays the same", "Increases by 6%"], correct: 1, exp: "When inflation (6%) > return (5%), real purchasing power decreases by ~1% per year." },
      { q: "The Rule of 72 tells you:", options: ["How to calculate tax", "How many years to double money at a given rate", "The maximum safe withdrawal rate", "Annual inflation rate"], correct: 1, exp: "Divide 72 by the annual return rate to get years to double. E.g., 12% → 6 years." },
      { q: "What does 'compound interest' mean?", options: ["Fixed interest on principal only", "Interest earned on principal + accumulated interest", "Interest paid monthly", "Tax-free interest"], correct: 1, exp: "Compound interest earns returns on both your principal AND the returns you've already earned." },
      { q: "RBI's inflation target for India is:", options: ["2%", "4%", "6%", "8%"], correct: 1, exp: "RBI targets 4% inflation with a 2-6% tolerance band." },
      { q: "₹1 Lakh at 12% for 6 years (compounded) will grow to approximately:", options: ["₹1.72 Lakhs", "₹1.72 Lakhs", "₹2.0 Lakhs", "₹1.5 Lakhs"], correct: 2, exp: "Using Rule of 72: money doubles every 6 years at 12%. So ₹1L → ~₹2L in 6 years." },
    ]
  },
  {
    id: 2, name: "Stock Market 101", description: "NSE, BSE, stocks, IPOs, and how markets work",
    icon: "TrendingUp", color: "#00D4FF", bgGrad: "from-cyan-900/40 to-blue-900/40",
    requiredXP: 500, xpReward: 500, badgeName: "Market Explorer",
    lessons: [
      { id: "2-1", title: "What is a Stock?", duration: "6 min", xpReward: 50,
        content: `A **stock** (also called a share or equity) represents a tiny piece of ownership in a company.\n\nWhen you buy 10 shares of TCS, you literally own a tiny fraction of Tata Consultancy Services — its assets, future earnings, and growth.\n\n**Why do companies issue stocks?**\nTo raise money for growth! Instead of taking a loan, a company sells ownership stakes to the public.\n\n**How do you make money from stocks?**\n1. **Price appreciation**: Buy at ₹1,000, sell at ₹1,500 → ₹500 profit\n2. **Dividends**: Company shares profits with shareholders (e.g., ITC pays ~3% dividend yield)\n\n**Key terms**:\n- **Market Cap** = Share Price × Total Shares. Measures company's total value.\n- **Large Cap**: Market cap > ₹20,000 Cr (Reliance, TCS)\n- **Mid Cap**: ₹5,000 - ₹20,000 Cr\n- **Small Cap**: < ₹5,000 Cr`,
        terms: ["stock", "equity", "dividend", "market capitalization"]
      },
      { id: "2-2", title: "NSE & BSE — India's Exchanges", duration: "7 min", xpReward: 75,
        content: `India has two major stock exchanges:\n\n**BSE (Bombay Stock Exchange)**\n- Asia's oldest stock exchange (est. 1875)\n- 5,000+ listed companies\n- Benchmark index: **Sensex** (30 largest companies)\n\n**NSE (National Stock Exchange)**\n- Founded in 1992, more modern\n- Benchmark index: **Nifty 50** (50 largest companies)\n- Handles ~90% of Indian equity trading volume\n\n**How do they work?**\nWhen you place a buy order, it goes through your broker → exchange → matched with a seller. The entire process takes milliseconds!\n\n**SEBI** regulates both exchanges to protect investors and ensure fair trading.\n\n**Market hours**: 9:15 AM to 3:30 PM, Monday to Friday (IST). Pre-market: 9:00-9:15 AM.`,
        terms: ["NSE", "BSE", "Nifty 50", "Sensex", "SEBI"]
      },
      { id: "2-3", title: "IPOs — How Companies Go Public", duration: "8 min", xpReward: 100,
        content: `**IPO (Initial Public Offering)** is when a private company offers its shares to the public for the first time to raise capital.\n\n**Why companies do IPOs:**\n- Raise funds for expansion\n- Allow early investors to exit\n- Increase brand visibility\n\n**IPO Process in India:**\n1. Company appoints investment banks (book-running lead managers)\n2. Files DRHP (Draft Red Herring Prospectus) with SEBI\n3. SEBI reviews and approves\n4. Price band set (e.g., ₹700-₹720 per share)\n5. Subscription opens for 3 days\n6. Allotment and listing on NSE/BSE\n\n**How to apply:**\n- Through UPI (ASBA process)\n- Minimum bid: 1 lot (usually 14-17 shares)\n- Results in 6-7 days after subscription closes\n\n**Famous India IPOs**: Zomato (2021), LIC (2022), Paytm (2021)`,
        terms: ["IPO", "DRHP", "book-running lead manager", "allotment", "ASBA"]
      },
    ],
    quiz: [
      { q: "What does owning a stock mean?", options: ["Lending money to the company", "Owning a portion of the company", "Getting a guaranteed return", "Becoming the company's CEO"], correct: 1, exp: "Stock = equity ownership. You own a fraction of the company's assets and earnings." },
      { q: "Which index tracks the 50 largest companies on NSE?", options: ["Sensex", "Nifty 50", "BSE 500", "Nifty Next 50"], correct: 1, exp: "Nifty 50 tracks the top 50 companies on the National Stock Exchange." },
      { q: "In an IPO, who are the sellers?", options: ["Existing shareholders only", "The company and/or existing shareholders", "SEBI", "Stock exchanges"], correct: 1, exp: "In an IPO, the company issues new shares (raising funds) and/or existing shareholders sell their stakes." },
      { q: "NSE market hours are:", options: ["8 AM to 4 PM", "9:15 AM to 3:30 PM", "10 AM to 4 PM", "9 AM to 3 PM"], correct: 1, exp: "NSE/BSE equity market runs 9:15 AM to 3:30 PM, Monday-Friday." },
      { q: "What is market capitalization?", options: ["Annual revenue of a company", "Share price × total outstanding shares", "Net profit of a company", "Total debt of a company"], correct: 1, exp: "Market cap = Current share price × Total number of outstanding shares. It measures the company's total market value." },
    ]
  },
  {
    id: 3, name: "Equity Trading", description: "Order types, reading quotes, and bid-ask spread",
    icon: "BarChart2", color: "#00FF88", bgGrad: "from-emerald-900/40 to-green-900/40",
    requiredXP: 1000, xpReward: 600, badgeName: "First Trader",
    lessons: [
      { id: "3-1", title: "Reading a Stock Quote", duration: "5 min", xpReward: 50,
        content: `A stock quote shows you everything you need to know at a glance:\n\n**HDFC Bank: ₹1,642.30 (+0.53%)**\n- **CMP**: Current Market Price = ₹1,642.30\n- **Change**: +₹8.65 (+0.53%) from yesterday's close\n- **Open**: Price at 9:15 AM today\n- **High/Low**: Today's highest and lowest trade price\n- **52W High/Low**: Highest/lowest price in last 52 weeks\n- **Volume**: Number of shares traded today\n- **Market Cap**: Total company value\n\n**P/E Ratio**: Price ÷ Earnings Per Share. Tells you how expensive the stock is relative to its earnings.\n\n**Circuit Breaker**: NSE/BSE halt trading if a stock moves ±5%, ±10%, or ±20% in a day.`,
        terms: ["CMP", "52-week high/low", "volume", "circuit breaker", "P/E ratio"]
      },
      { id: "3-2", title: "Order Types — Your Trading Toolkit", duration: "8 min", xpReward: 75,
        content: `**Market Order**: Buy/sell at the CURRENT market price immediately.\n- Pros: Instant execution\n- Cons: You don't control the exact price\n- Use when: You want to buy/sell RIGHT NOW\n\n**Limit Order**: Buy/sell only at a SPECIFIC price or better.\n- "Buy RELIANCE at ₹2,400 or lower"\n- Order waits until price hits ₹2,400\n- Pros: Control over price; Cons: May not execute\n\n**Stop-Loss Order**: Auto-sell if price falls below a level.\n- "If INFY drops to ₹1,400, sell automatically"\n- Protects you from big losses\n- Essential risk management tool!\n\n**GTT (Good Till Triggered)**: A persistent order that stays active until triggered.\n- Can set target price (profit booking) AND stop-loss in one go\n- Zerodha and other brokers support GTT\n\n**Pro tip**: Most beginners only use Market and Limit orders. Master these first!`,
        terms: ["market order", "limit order", "stop-loss", "GTT"]
      },
      { id: "3-3", title: "Bid-Ask Spread Explained", duration: "6 min", xpReward: 100,
        content: `The **bid-ask spread** is the difference between what buyers are willing to pay and what sellers want.\n\n**Bid Price**: Highest price a buyer will pay (₹1,641.50)\n**Ask Price**: Lowest price a seller will accept (₹1,642.30)\n**Spread**: Ask - Bid = ₹0.80\n\n**Why does the spread matter?**\n- When you buy a Market Order, you pay the ASK price\n- When you sell a Market Order, you get the BID price\n- The spread is an implicit cost of trading\n\n**Liquid stocks** (like Nifty 50) have tight spreads (₹0.05 - ₹1)\n**Illiquid stocks** can have spreads of ₹5-50+, costing you significantly!\n\n**Market Makers**: Professional firms that always provide bid and ask prices, ensuring liquidity. They profit from the spread.\n\n**Rule**: Always check the spread before trading. High spread = higher trading cost.`,
        terms: ["bid price", "ask price", "spread", "liquidity", "market maker"]
      },
    ],
    quiz: [
      { q: "A limit buy order at ₹2,400 for RELIANCE (currently ₹2,456) will:", options: ["Execute immediately at ₹2,456", "Wait until price drops to ₹2,400", "Cancel immediately", "Execute at ₹2,428 (midpoint)"], correct: 1, exp: "A limit buy order executes only when the price reaches ₹2,400 or lower." },
      { q: "What is a stop-loss order used for?", options: ["To maximize profits", "To limit losses by auto-selling if price falls", "To buy at the best price", "To track portfolio performance"], correct: 1, exp: "Stop-loss auto-sells when price drops to your set level, limiting downside losses." },
      { q: "If Nifty falls 8%, what type of circuit breaker triggers?", options: ["No circuit breaker", "5% circuit breaker", "10% circuit breaker", "20% circuit breaker"], correct: 2, exp: "NSE/BSE have circuit breakers at 10%, 15%, and 20% for Nifty/Sensex." },
      { q: "The bid price is:", options: ["The price at which sellers want to sell", "The highest price a buyer will pay", "The average of opening and closing price", "Last traded price"], correct: 1, exp: "Bid = what buyers will pay. Ask = what sellers want. You buy at Ask, sell at Bid." },
      { q: "Which order type gives you most price certainty but might not execute?", options: ["Market order", "Stop-loss order", "Limit order", "GTT order"], correct: 2, exp: "Limit orders give you price certainty but may not execute if the stock never reaches your price." },
    ]
  },
  {
    id: 4, name: "Fundamental Analysis", description: "P/E, EPS, financial statements, and company valuation",
    icon: "FileText", color: "#FFB800", bgGrad: "from-amber-900/40 to-yellow-900/40",
    requiredXP: 1600, xpReward: 700, badgeName: "Value Analyst",
    lessons: [
      { id: "4-1", title: "Reading Financial Statements", duration: "10 min", xpReward: 75,
        content: `Companies publish 3 key financial statements quarterly:\n\n**Income Statement (P&L)**\n- Revenue → Gross Profit → EBITDA → Net Profit\n- Tells you: Is the company profitable?\n- Key metric: Net Profit Margin = Net Profit / Revenue\n\n**Balance Sheet**\n- Assets = Liabilities + Shareholder Equity\n- Tells you: What does the company own vs. owe?\n- Key metric: Debt-to-Equity Ratio\n\n**Cash Flow Statement**\n- Operating, Investing, Financing cash flows\n- Tells you: Is the company generating real cash?\n- **Most important**: Companies can show profit on paper but be cash-starved!\n\n**Example (TCS FY25)**:\n- Revenue: ₹2,36,000 Cr\n- Net Profit: ₹46,000 Cr\n- Net Margin: ~19.5%\n- Cash from Operations: ₹52,000 Cr`,
        terms: ["income statement", "balance sheet", "cash flow", "EBITDA", "net profit margin"]
      },
      { id: "4-2", title: "Key Ratios — The Investor's Toolkit", duration: "9 min", xpReward: 100,
        content: `**Valuation Ratios:**\n- **P/E Ratio**: Price / EPS. Lower = cheaper. Nifty 50 avg: 20-25\n- **P/B Ratio**: Price / Book Value. < 1 means trading below asset value\n- **EV/EBITDA**: Enterprise Value / EBITDA. Good for capital-heavy businesses\n\n**Profitability Ratios:**\n- **ROE (Return on Equity)**: Net Profit / Equity. Higher = better use of capital. TCS ROE ~50%!\n- **ROCE**: Return on Capital Employed\n- **Gross Margin**: (Revenue - COGS) / Revenue\n\n**Leverage Ratios:**\n- **Debt-to-Equity**: Total Debt / Equity. > 2 can be risky\n- **Interest Coverage**: EBIT / Interest Expense. > 3 is generally healthy\n\n**Dividend:**\n- **Dividend Yield**: Annual Dividend / Share Price. ITC ~3.5%\n\n**Golden rule**: No single ratio tells the full story. Use multiple ratios together!`,
        terms: ["P/E ratio", "P/B ratio", "ROE", "ROCE", "debt-to-equity", "dividend yield"]
      },
      { id: "4-3", title: "Evaluating a Company — The Complete Picture", duration: "10 min", xpReward: 100,
        content: `**Qualitative Analysis:**\n- Business model: How does it make money?\n- Competitive moat: What keeps competitors out? (Brand, patents, network effects)\n- Management quality: Track record, corporate governance, ESOP culture\n- Industry tailwinds: Is the sector growing?\n\n**Quantitative Analysis:**\n- Revenue growth: Is it growing 15%+ YoY consistently?\n- Margin expansion: Are margins improving over time?\n- Return ratios: ROE > 15%, ROCE > 15%\n- Debt: Low and manageable\n\n**Valuation:**\n- Compare P/E with sector average\n- Compare with historical P/E (is it cheap or expensive vs history?)\n\n**Example — Evaluating HDFC Bank:**\n✓ Business: Largest private bank, strong retail franchise\n✓ Moat: Brand trust, distribution network\n✓ Numbers: ROA 2%, ROE 16%, NIM 4%+\n✓ Valuation: P/B 2.5x vs 10-year avg of 3.5x — potentially undervalued!`,
        terms: ["competitive moat", "qualitative analysis", "intrinsic value", "margin of safety"]
      },
    ],
    quiz: [
      { q: "A company with P/E of 10 compared to sector P/E of 20 is:", options: ["Definitely overvalued", "Possibly undervalued or has problems", "Always a good buy", "About fairly valued"], correct: 1, exp: "Low P/E vs sector could mean undervaluation (good) OR poor growth prospects (bad). Always investigate why." },
      { q: "ROE measures:", options: ["How efficiently assets generate revenue", "How much profit is generated per rupee of shareholder equity", "Company's debt levels", "Price relative to book value"], correct: 1, exp: "ROE = Net Profit / Shareholder Equity. Shows efficiency of using equity capital." },
      { q: "Which statement shows if a company is actually generating cash?", options: ["Income statement", "Balance sheet", "Cash flow statement", "Audit report"], correct: 2, exp: "Cash flow statement shows actual cash generation, unlike income statement which uses accrual accounting." },
      { q: "Debt-to-Equity ratio of 3.5 for a non-financial company typically means:", options: ["Very healthy leverage", "Moderate debt", "Potentially risky leverage", "No debt at all"], correct: 2, exp: "D/E > 2-3 for non-financial companies is generally considered high leverage and potentially risky." },
      { q: "A company's 'competitive moat' refers to:", options: ["Its water infrastructure", "Sustainable competitive advantages that protect it from rivals", "The company headquarters location", "Its patent portfolio only"], correct: 1, exp: "Moat = barriers that protect a company's market share and profitability from competitors." },
    ]
  },
  {
    id: 5, name: "Technical Analysis", description: "Charts, indicators, candlesticks, and trends",
    icon: "Activity", color: "#6C63FF", bgGrad: "from-violet-900/40 to-indigo-900/40",
    requiredXP: 2300, xpReward: 700, badgeName: "Chart Wizard",
    lessons: [
      { id: "5-1", title: "Reading Candlestick Charts", duration: "8 min", xpReward: 75,
        content: `Candlestick charts originated in 18th century Japan to track rice prices. Each candle shows 4 data points:\n\n**Anatomy of a Candle:**\n- **Open**: Price at start of period\n- **Close**: Price at end of period\n- **High**: Highest price during period\n- **Low**: Lowest price during period\n\n**Green Candle**: Close > Open (bullish — price went up)\n**Red Candle**: Close < Open (bearish — price went down)\n\n**Common Patterns:**\n- **Doji**: Open ≈ Close → indecision in market\n- **Hammer**: Small body, long lower wick → potential reversal up\n- **Shooting Star**: Small body, long upper wick → potential reversal down\n- **Engulfing**: Big candle 'swallows' previous candle → strong reversal signal\n\n**Key insight**: One candle tells a story; multiple candles tell the full chapter!`,
        terms: ["candlestick", "OHLC", "doji", "hammer", "engulfing pattern"]
      },
      { id: "5-2", title: "Moving Averages & Trend Analysis", duration: "8 min", xpReward: 75,
        content: `**Moving Average (MA)** smooths out price noise to show the underlying trend.\n\n**Simple Moving Average (SMA)**: Average of last N closing prices\n- 50-day MA: Medium-term trend\n- 200-day MA: Long-term trend\n\n**Exponential Moving Average (EMA)**: Gives more weight to recent prices, reacts faster.\n\n**Golden Cross**: 50-day MA crosses ABOVE 200-day MA → Strong bullish signal\n**Death Cross**: 50-day MA crosses BELOW 200-day MA → Strong bearish signal\n\n**Support & Resistance:**\n- **Support**: Price level where buying is strong (floor)\n- **Resistance**: Price level where selling is strong (ceiling)\n- When resistance is broken, it often becomes new support!\n\n**Trend identification:**\n- Higher Highs + Higher Lows = Uptrend\n- Lower Highs + Lower Lows = Downtrend`,
        terms: ["SMA", "EMA", "golden cross", "death cross", "support", "resistance"]
      },
      { id: "5-3", title: "RSI, MACD & Bollinger Bands", duration: "10 min", xpReward: 100,
        content: `**RSI (Relative Strength Index)** — Momentum Indicator (0-100)\n- < 30: Oversold → potential BUY signal\n- > 70: Overbought → potential SELL signal\n- Period: Typically 14 days\n\n**MACD (Moving Average Convergence Divergence)**\n- MACD Line = 12-day EMA - 26-day EMA\n- Signal Line = 9-day EMA of MACD Line\n- **Bullish**: MACD crosses above Signal Line\n- **Bearish**: MACD crosses below Signal Line\n- Histogram shows momentum strength\n\n**Bollinger Bands**\n- Middle Band: 20-day SMA\n- Upper Band: SMA + 2×Standard Deviation\n- Lower Band: SMA - 2×Standard Deviation\n- Price touching UPPER band = potentially overbought\n- Price touching LOWER band = potentially oversold\n- **Squeeze**: Bands narrow → big move coming!\n\n**Important**: Never use just ONE indicator. Combine RSI + MACD + Bollinger Bands for stronger signals.`,
        terms: ["RSI", "MACD", "Bollinger Bands", "overbought", "oversold", "momentum"]
      },
    ],
    quiz: [
      { q: "A green (bullish) candlestick means:", options: ["High was very high", "Closing price was higher than opening price", "Volume was high", "Stock hit 52-week high"], correct: 1, exp: "Green candle: Close > Open. Red candle: Close < Open." },
      { q: "When the 50-day MA crosses above the 200-day MA, it's called:", options: ["Death Cross", "Bear Cross", "Golden Cross", "Silver Cross"], correct: 2, exp: "Golden Cross (50MA above 200MA) is a strong bullish signal. Death Cross is the opposite." },
      { q: "RSI of 25 indicates:", options: ["Overbought conditions", "Neutral market", "Oversold — potential buying opportunity", "Very high volume"], correct: 2, exp: "RSI < 30 = oversold. The stock may have fallen too much and could bounce back." },
      { q: "Bollinger Band squeeze (bands narrowing) typically means:", options: ["Low volatility, big move likely soon", "Stock is about to crash", "Stock is overbought", "Dividend is coming"], correct: 0, exp: "When Bollinger Bands squeeze, it signals a period of low volatility before a potentially large directional move." },
      { q: "Support level in technical analysis is:", options: ["Price ceiling where selling increases", "Price floor where buying is expected to be strong", "Average price of last 20 days", "52-week low price"], correct: 1, exp: "Support is a price level where buying interest typically exceeds selling, preventing further price decline." },
    ]
  },
  {
    id: 6, name: "Mutual Funds & ETFs", description: "SIP, NAV, expense ratio, ELSS, and index funds",
    icon: "PieChart", color: "#FF8C00", bgGrad: "from-orange-900/40 to-red-900/40",
    requiredXP: 3000, xpReward: 700, badgeName: "SIP Master",
    lessons: [
      { id: "6-1", title: "What are Mutual Funds?", duration: "7 min", xpReward: 50,
        content: `A **mutual fund** pools money from thousands of investors to buy a diversified portfolio of stocks, bonds, or other assets.\n\n**How it works:**\n1. You invest ₹1,000\n2. Fund manager pools it with other investors' money\n3. Buys a basket of stocks/bonds\n4. Your ₹1,000 now represents a tiny ownership in all those assets\n\n**NAV (Net Asset Value)**: Price of 1 unit of the mutual fund\n- NAV = (Total Assets - Liabilities) / Number of Units\n- Calculated daily after market close\n\n**Key players:**\n- **AMC** (Asset Management Company): Manages the fund (HDFC Mutual Fund, SBI Mutual, Nippon)\n- **Fund Manager**: Professional who makes investment decisions\n- **Trustee**: Oversees the fund in investors' interest\n\n**Regulation**: All mutual funds in India are regulated by SEBI.`,
        terms: ["NAV", "AMC", "fund manager", "mutual fund unit"]
      },
      { id: "6-2", title: "Types of Funds — Finding Your Match", duration: "9 min", xpReward: 75,
        content: `**By asset class:**\n- **Equity Funds**: Invest in stocks. High risk, high return. Best for 7+ year horizon.\n- **Debt Funds**: Invest in bonds/FDs. Lower risk, steady returns. Good for 1-3 years.\n- **Hybrid Funds**: Mix of equity and debt. Balanced risk.\n\n**Popular Equity Fund categories:**\n- **Index Fund**: Tracks Nifty 50 or Sensex passively. LOW expense ratio (0.1-0.2%)!\n- **ELSS (Equity Linked Savings Scheme)**: Tax saving (Section 80C), 3-year lock-in, equity exposure\n- **Large Cap**: Only top 100 companies. Stable.\n- **Small Cap**: High growth potential, higher risk\n\n**Expense Ratio**: Annual fee charged as % of AUM\n- Index funds: 0.05-0.2%\n- Active large cap: 0.5-1.5%\n- This matters HUGELY over 20-30 years!\n\n**Tax:**\n- STCG (< 1 year): 20%\n- LTCG (> 1 year): 12.5% on gains above ₹1.25 Lakh`,
        terms: ["ELSS", "index fund", "expense ratio", "STCG", "LTCG", "AUM"]
      },
      { id: "6-3", title: "SIP — The Power of Regularity", duration: "8 min", xpReward: 100,
        content: `**SIP (Systematic Investment Plan)**: Invest a fixed amount at regular intervals (monthly/weekly) automatically.\n\n**Why SIP beats lump sum for most people:**\n1. **Rupee Cost Averaging**: Buy more units when prices are low, fewer when high. Averages your cost.\n2. **Discipline**: Automated investing prevents emotional decisions\n3. **Start small**: Begin with just ₹500/month!\n4. **Power of consistency**: ₹10,000/month at 12% for 20 years = ₹99.9 Lakhs!\n\n**SIP Return Calculation:**\nM = P × [((1 + r)^n - 1) / r] × (1 + r)\n- P = Monthly SIP amount\n- r = Monthly interest rate\n- n = Number of months\n\n**Pro tips:**\n- Increase SIP by 10% every year (Step-up SIP)\n- Don't stop SIP during market crashes — this is when you buy MOST units!\n- Index funds + long SIP = Warren Buffett's advice for regular investors`,
        terms: ["SIP", "rupee cost averaging", "step-up SIP", "lump sum"]
      },
    ],
    quiz: [
      { q: "NAV stands for:", options: ["Net Annual Value", "Net Asset Value", "National Asset Valuation", "Net Allocation Value"], correct: 1, exp: "NAV = (Total Assets - Liabilities) / Number of Units. The price of 1 unit of a mutual fund." },
      { q: "Which mutual fund category offers tax deduction under Section 80C?", options: ["Index Funds", "Large Cap Funds", "ELSS", "Liquid Funds"], correct: 2, exp: "ELSS (Equity Linked Savings Scheme) offers up to ₹1.5L tax deduction under 80C with 3-year lock-in." },
      { q: "Rupee Cost Averaging in SIP means:", options: ["Investing the same amount in rupees always", "Automatically buying more units when NAV is low, fewer when high", "Converting SIP to lump sum annually", "Hedging against currency risk"], correct: 1, exp: "With fixed SIP amount, you buy more units when NAV is low and fewer when high, averaging your purchase cost." },
      { q: "For a beginner investing for 15+ years, which is most recommended?", options: ["Gold ETF only", "FD only", "Low-cost index fund via SIP", "Small cap active fund"], correct: 2, exp: "Low-cost index funds (Nifty 50) via SIP are widely recommended for long-term wealth creation for beginners." },
      { q: "Expense ratio of 0.1% vs 1.5% on ₹10 Lakh over 20 years at 12% return makes a difference of approximately:", options: ["₹5 Lakhs", "₹15 Lakhs", "₹30+ Lakhs", "₹1 Lakh"], correct: 2, exp: "Small differences in expense ratio compound into massive differences over 20+ years. This is why low-cost index funds matter!" },
    ]
  },
  {
    id: 7, name: "Futures", description: "Derivatives, futures contracts, hedging, and margin",
    icon: "Zap", color: "#FF4444", bgGrad: "from-red-900/40 to-rose-900/40",
    requiredXP: 3700, xpReward: 800, badgeName: "Futures Trader",
    lessons: [
      { id: "7-1", title: "Introduction to Derivatives", duration: "7 min", xpReward: 50,
        content: `**Derivatives** are financial contracts whose value is *derived* from an underlying asset (stock, index, commodity, currency).\n\n**Types of Derivatives:**\n1. **Futures**: Obligation to buy/sell at future date and price\n2. **Options**: Right (not obligation) to buy/sell\n3. **Forwards**: OTC (not exchange traded) futures\n4. **Swaps**: Exchange of cash flows\n\n**Why do derivatives exist?**\n- **Hedging**: Protect existing portfolio from downside\n- **Speculation**: Profit from price movements with leverage\n- **Arbitrage**: Profit from price differences\n\n**Scale in India**: NSE is the world's LARGEST derivatives exchange by volume! Nifty and Bank Nifty options are insanely popular.\n\n**Warning**: Derivatives are double-edged. 90%+ of retail derivatives traders lose money. Understanding them is crucial before trading.`,
        terms: ["derivative", "underlying asset", "hedging", "speculation", "leverage"]
      },
      { id: "7-2", title: "Futures Contracts in Detail", duration: "9 min", xpReward: 75,
        content: `**Futures Contract**: A binding agreement to buy or sell an asset at a predetermined price on a specific future date.\n\n**Key components:**\n- **Underlying**: RELIANCE, NIFTY, CRUDE OIL\n- **Lot size**: Minimum quantity (NIFTY futures = 75 units)\n- **Expiry**: Last Thursday of the month\n- **Margin**: Initial deposit required (10-15% of contract value)\n\n**Example:**\n- NIFTY Futures at 23,000 with lot size 75\n- Contract value = 23,000 × 75 = ₹17.25 Lakhs\n- Margin required = ~₹1.5 Lakhs (9%)\n\n**Mark to Market (MTM)**:\nProfit/Loss is calculated and credited/debited DAILY. If losses exceed margin, you get a margin call!\n\n**Open Interest**: Total outstanding futures contracts. Rising OI + Rising Price = bullish. Rising OI + Falling Price = bearish.`,
        terms: ["futures contract", "lot size", "expiry", "margin", "mark-to-market", "open interest"]
      },
      { id: "7-3", title: "Hedging with Futures", duration: "8 min", xpReward: 100,
        content: `**Hedging** is using derivatives to reduce risk on an existing position. Think of it as buying insurance for your portfolio.\n\n**Portfolio Hedge Example:**\nYou own ₹10 Lakh worth of Nifty 50 stocks. You're worried about a correction.\n\n*Solution*: SELL Nifty futures worth ₹10 Lakh\n- If Nifty falls 10%: Portfolio loses ₹1L, but futures gains ₹1L → Protected!\n- If Nifty rises 10%: Portfolio gains ₹1L, but futures loses ₹1L → No gain, but no loss either\n\n**Who uses hedging?**\n- Exporters (hedge currency risk)\n- Importers (hedge oil price risk)\n- Fund managers (protect large portfolios)\n- Airlines (hedge jet fuel price)\n\n**Tata Motors example**: Tata Motors exports cars to UK. They hedge GBP/INR to protect margins if rupee strengthens.\n\n**Key takeaway**: Professional traders and companies use derivatives for risk management, not just speculation.`,
        terms: ["hedge", "portfolio hedging", "currency risk", "commodity risk"]
      },
    ],
    quiz: [
      { q: "A futures contract is:", options: ["A right to buy/sell", "A binding obligation to buy/sell at a future date and price", "A type of mutual fund", "A loan from a broker"], correct: 1, exp: "Futures = binding obligation. Options = right (not obligation). This is the key distinction." },
      { q: "What is 'margin' in futures trading?", options: ["Your profit from a trade", "A deposit required as collateral to hold a futures position", "The minimum lot size", "Annual subscription fee"], correct: 1, exp: "Margin is a good faith deposit (10-15% of contract value) required to hold a futures position." },
      { q: "If you're worried your portfolio will fall, you would:", options: ["Buy futures", "Sell futures (short hedge)", "Do nothing", "Buy more stocks"], correct: 1, exp: "Selling (shorting) index futures hedges your equity portfolio against a market decline." },
      { q: "MTM (Mark to Market) in futures means:", options: ["Daily P&L calculation and settlement", "Monthly returns calculation", "Setting target prices", "Marking exit levels"], correct: 0, exp: "MTM means profits and losses are calculated and settled DAILY. Losses are debited from your margin account." },
      { q: "Nifty futures lot size is 75 units. At 23,000, the contract value is:", options: ["₹23,000", "₹1,72,500", "₹17,25,000", "₹2,30,00,000"], correct: 2, exp: "Contract value = 23,000 × 75 = ₹17,25,000. This is why futures provide high leverage." },
    ]
  },
  {
    id: 8, name: "Options", description: "Calls, puts, Greeks, premiums, and payoff diagrams",
    icon: "GitBranch", color: "#9B59B6", bgGrad: "from-purple-900/40 to-violet-900/40",
    requiredXP: 4500, xpReward: 900, badgeName: "Options Guru",
    lessons: [
      { id: "8-1", title: "Call and Put Options", duration: "9 min", xpReward: 75,
        content: `Options give you the **RIGHT** (not obligation) to buy or sell an asset at a specific price before a specific date.\n\n**Call Option**: Right to BUY the underlying at strike price\n- "I have the right to buy RELIANCE at ₹2,400 anytime before March expiry"\n- Buy call when you're bullish\n\n**Put Option**: Right to SELL the underlying at strike price\n- "I have the right to sell NIFTY at 23,000 anytime before March expiry"\n- Buy put when you're bearish (or for portfolio protection)\n\n**Key Terms:**\n- **Strike Price**: The agreed buy/sell price\n- **Premium**: Price you pay for the option contract\n- **Expiry**: Date the option expires\n- **Lot Size**: Nifty options = 75 units\n\n**ITM/ATM/OTM:**\n- **ITM** (In the Money): Option has intrinsic value\n- **ATM** (At the Money): Strike = Current Price\n- **OTM** (Out of the Money): Option has no intrinsic value (yet!)`,
        terms: ["call option", "put option", "strike price", "premium", "ITM", "ATM", "OTM"]
      },
      { id: "8-2", title: "Option Pricing — What You Pay For", duration: "8 min", xpReward: 75,
        content: `**Option Premium = Intrinsic Value + Time Value**\n\n**Intrinsic Value**: How much the option is immediately profitable\n- Call ITM: Current Price - Strike Price\n- Put ITM: Strike Price - Current Price\n- OTM options have 0 intrinsic value\n\n**Time Value (Extrinsic Value)**:\nExtra premium paid for the *chance* the option becomes profitable. Decays to ZERO at expiry!\n\n**Black-Scholes Model**: The famous formula to price options\nFactors: Current price, strike, time to expiry, volatility, risk-free rate\n\n**Implied Volatility (IV)**:\n- How much the market *expects* the stock to move\n- High IV = expensive options (fear/uncertainty)\n- Low IV = cheap options (calm market)\n- **VIX** (India VIX): NSE's fear gauge. High VIX = fearful market\n\n**Option buying vs selling:**\n- **Buyer**: Limited risk (premium paid), unlimited upside\n- **Seller (Writer)**: Unlimited risk, limited profit (premium received)`,
        terms: ["intrinsic value", "time value", "Black-Scholes", "implied volatility", "India VIX"]
      },
      { id: "8-3", title: "The Greeks — Option Sensitivities", duration: "10 min", xpReward: 100,
        content: `The "Greeks" measure how option prices change with various factors:\n\n**Delta (Δ)**: Change in option price per ₹1 change in underlying\n- ATM call: Delta ≈ 0.5 (option moves ₹0.5 per ₹1 of stock)\n- Deep ITM call: Delta ≈ 1 (moves like the stock)\n- OTM call: Delta ≈ 0.1-0.3\n\n**Theta (Θ)**: Time decay — option loses value daily as expiry approaches\n- Enemies of option buyers, friends of sellers\n- Accelerates rapidly in last 2 weeks before expiry\n\n**Gamma (Γ)**: Rate of change of Delta\n- High gamma: Delta changes rapidly (near ATM, near expiry)\n\n**Vega (V)**: Sensitivity to Implied Volatility changes\n- Buy options before big events (earnings, RBI policy) when IV expands\n\n**Key insights:**\n- Option buyers fight Theta (time decay)\n- Option sellers love calm, high-IV markets\n- Nifty option sellers earn 'rent' from time decay — but can get crushed in volatile markets!`,
        terms: ["delta", "theta", "gamma", "vega", "time decay", "implied volatility"]
      },
    ],
    quiz: [
      { q: "A Call option gives you the right to:", options: ["Sell at strike price", "Buy at strike price", "Short sell the stock", "Receive dividends"], correct: 1, exp: "Call = right to BUY at strike price. Put = right to SELL at strike price." },
      { q: "Theta in options represents:", options: ["Rate of price change", "Time decay — daily loss in option value", "Sensitivity to volatility", "Change in delta"], correct: 1, exp: "Theta measures time decay. Every day that passes, options lose some value (everything else equal)." },
      { q: "An OTM (Out of the Money) call option has:", options: ["High intrinsic value", "Zero intrinsic value, only time value", "Delta of 0.9", "No time value"], correct: 1, exp: "OTM options have zero intrinsic value. Their premium consists entirely of time value." },
      { q: "India VIX rising sharply means:", options: ["Markets are calm", "Markets are fearful and options become expensive", "Nifty will rise", "Interest rates are falling"], correct: 1, exp: "India VIX is the fear gauge. Rising VIX = market fear/uncertainty = options become more expensive (higher IV)." },
      { q: "Which Greek helps understand how much an option price changes for ₹1 move in the underlying?", options: ["Theta", "Gamma", "Delta", "Vega"], correct: 2, exp: "Delta measures the option's sensitivity to underlying price movements. ATM call has Delta ~0.5." },
    ]
  },
  {
    id: 9, name: "Commodities", description: "Gold, silver, crude oil, and commodity trading",
    icon: "Gem", color: "#F4A460", bgGrad: "from-yellow-900/40 to-amber-900/40",
    requiredXP: 5400, xpReward: 800, badgeName: "Commodity Trader",
    lessons: [
      { id: "9-1", title: "Gold & Silver — Safe Haven Assets", duration: "7 min", xpReward: 50,
        content: `**Gold** has been a store of value for 5,000+ years. In India, it has special cultural significance AND investment appeal.\n\n**How to invest in Gold (modern ways):**\n1. **Sovereign Gold Bonds (SGBs)**: Government bonds in gold units, 2.5% annual interest + gold price appreciation. Best option!\n2. **Gold ETFs**: Trade on NSE like stocks (GOLDBEES)\n3. **Digital Gold**: Via apps like PhonePe/Paytm\n4. **Gold Mutual Funds**: Fund of funds investing in Gold ETFs\n5. Physical gold: Jewellery (high making charges, not recommended for investment)\n\n**Silver** is more volatile than gold but has industrial uses (solar panels, electronics, EV batteries).\n\n**Gold's role in portfolio:**\n- Negative correlation with equities (rises when stocks fall)\n- Hedge against currency depreciation and geopolitical risk\n- Allocation: 5-15% of portfolio typically recommended\n\n**MCX**: Multi Commodity Exchange is India's primary commodity exchange.`,
        terms: ["sovereign gold bonds", "gold ETF", "MCX", "safe haven asset"]
      },
      { id: "9-2", title: "Crude Oil — The Black Gold", duration: "8 min", xpReward: 75,
        content: `Crude oil is the most actively traded commodity globally. India imports ~85% of its oil needs.\n\n**Types of Crude:**\n- **WTI (West Texas Intermediate)**: US benchmark\n- **Brent Crude**: European/global benchmark (India uses this)\n- **Price difference**: Brent is usually $1-3/barrel higher than WTI\n\n**Why it matters for India:**\n- High oil prices → higher inflation (petrol, diesel, plastics, fertilizers)\n- High oil prices → wider current account deficit → rupee weakens\n- Impact on OMCs (IOC, HPCL, BPCL) and aviation stocks (IndiGo, Air India)\n\n**Trading crude on MCX:**\n- Lot size: 100 barrels\n- Quoted in ₹/barrel\n- Contracts expire monthly\n\n**Oil price influencers:**\n- OPEC+ decisions\n- US inventory data\n- Geopolitical events (Middle East wars)\n- Global economic growth (China demand)`,
        terms: ["WTI", "Brent crude", "OPEC", "OMC", "current account deficit"]
      },
      { id: "9-3", title: "Building a Commodity Allocation", duration: "8 min", xpReward: 100,
        content: `**Why commodities in your portfolio?**\n1. **Inflation hedge**: Commodity prices often rise with inflation\n2. **Diversification**: Low correlation with stocks and bonds\n3. **Real asset exposure**: Physical goods with intrinsic value\n\n**Agricultural Commodities:**\n- Wheat, rice, sugar, soybeans, cotton\n- Prices driven by weather, monsoon, government policy (MSP)\n- Available on NCDEX (National Commodity & Derivatives Exchange)\n\n**Commodity Super Cycles:**\n- Periods of sustained high commodity prices\n- Driven by emerging market demand (China 2003-2008, India 2020s?)\n- Electric Vehicle revolution driving demand for copper, lithium, nickel\n\n**Portfolio Allocation Strategy:**\n- Beginner: 5-10% in gold (SGB/ETF)\n- Intermediate: Add silver + possibly oil ETFs\n- Advanced: Direct commodity futures (only with experience!)\n\n**Indian ETFs:**\n- GOLDBEES (Gold ETF, NSE)\n- SILVERBEES (Silver ETF, NSE)`,
        terms: ["commodity", "inflation hedge", "NCDEX", "super cycle", "commodity ETF"]
      },
    ],
    quiz: [
      { q: "Best way for a retail investor to invest in gold in India:", options: ["Physical gold jewellery", "Sovereign Gold Bonds (SGB)", "Gold futures on MCX", "Gold coins from banks"], correct: 1, exp: "SGBs are best: government guaranteed, earn 2.5% interest AND gold price appreciation, no storage/making charges." },
      { q: "Rising crude oil prices affect India's economy by:", options: ["Reducing inflation", "Widening current account deficit and weakening rupee", "Strengthening rupee", "Reducing fiscal deficit"], correct: 1, exp: "India imports 85% of oil. High prices → higher import bill → wider CAD → rupee pressure." },
      { q: "Gold's correlation with equity markets is generally:", options: ["Strongly positive", "Neutral", "Negative (gold rises when stocks fall)", "Same as bonds"], correct: 2, exp: "Gold is a safe haven — investors flock to it during equity market crashes, making it negatively correlated." },
      { q: "MCX stands for:", options: ["Mumbai Commodity Exchange", "Multi Commodity Exchange", "Modern Currency Exchange", "Monetary Control Exchange"], correct: 1, exp: "MCX (Multi Commodity Exchange) is India's primary commodity futures exchange for gold, silver, crude oil, etc." },
      { q: "Which upcoming trend is boosting demand for copper and lithium?", options: ["AI computing needs", "Electric Vehicle revolution", "Cryptocurrency mining", "Real estate construction"], correct: 1, exp: "EVs require 3-4x more copper than ICE vehicles, plus massive lithium/cobalt/nickel for batteries." },
    ]
  },
  {
    id: 10, name: "Cryptocurrency", description: "Blockchain, Bitcoin, crypto trading, and risks",
    icon: "Cpu", color: "#F7931A", bgGrad: "from-orange-900/40 to-yellow-900/40",
    requiredXP: 6200, xpReward: 800, badgeName: "Crypto Explorer",
    lessons: [
      { id: "10-1", title: "Blockchain — The Technology Behind Crypto", duration: "8 min", xpReward: 50,
        content: `**Blockchain** is a distributed ledger — a database that is shared and synchronized across thousands of computers worldwide.\n\n**How it works (simple explanation):**\nImagine a Google spreadsheet that:\n- Everyone can read\n- No one person can edit or delete entries\n- Every edit is permanently recorded\n- No central authority controls it\n\nThat's essentially what blockchain is!\n\n**Key properties:**\n- **Decentralized**: No single point of control/failure\n- **Immutable**: Once recorded, data cannot be changed\n- **Transparent**: All transactions are publicly visible\n- **Trustless**: No need to trust a central authority\n\n**Consensus mechanisms:**\n- **Proof of Work (PoW)**: Bitcoin uses this. Computers (miners) solve complex puzzles to validate transactions. Energy-intensive.\n- **Proof of Stake (PoS)**: Ethereum uses this. Validators lock up coins as collateral. More energy-efficient.\n\n**Indian context**: India's blockchain initiatives include CBDC (Digital Rupee) launched by RBI.`,
        terms: ["blockchain", "distributed ledger", "decentralized", "proof of work", "proof of stake", "CBDC"]
      },
      { id: "10-2", title: "Bitcoin, Ethereum & the Crypto Ecosystem", duration: "9 min", xpReward: 75,
        content: `**Bitcoin (BTC)** — Digital Gold\n- Created in 2009 by anonymous 'Satoshi Nakamoto'\n- Fixed supply: Only 21 million BTC will EVER exist\n- Primary use: Store of value, digital gold\n- India price: ~₹68 Lakhs per BTC (volatile!)\n\n**Ethereum (ETH)** — Programmable Blockchain\n- Platform for smart contracts and DeFi applications\n- 'World computer' — runs decentralized applications (dApps)\n- Used for NFTs, DeFi, DAOs\n\n**Other major cryptos:**\n- **Solana (SOL)**: Fast, cheap transactions\n- **BNB**: Binance exchange token\n- **Stablecoins**: USDT, USDC — pegged to $1\n\n**India's crypto landscape:**\n- 30% flat tax on crypto gains (Budget 2022)\n- 1% TDS on crypto transactions > ₹50,000\n- No loss offset against other income\n- SEBI and RBI are working on regulatory framework\n\n**Key insight**: Crypto is legal in India to buy/sell, but regulation is evolving.`,
        terms: ["Bitcoin", "Ethereum", "smart contract", "stablecoin", "DeFi", "TDS on crypto"]
      },
      { id: "10-3", title: "Crypto Trading — Navigating Extreme Volatility", duration: "8 min", xpReward: 100,
        content: `Crypto is 5-10x more volatile than stocks. This creates both opportunities AND dangers.\n\n**Volatility examples:**\n- Bitcoin fell 80% in 2018, 65% in 2022\n- Bitcoin rose 1,000%+ in 2020-2021\n- ETH has had 90%+ drawdowns multiple times\n\n**Indian exchanges:**\n- WazirX, CoinDCX, Zebpay (domestic)\n- Binance, Coinbase (international)\n\n**Trading concepts:**\n- **HODLing**: Buy and hold long-term (strategy for believers)\n- **DCA (Dollar Cost Average)**: Same as SIP — invest fixed amount regularly\n- **Altcoin**: Any crypto that isn't Bitcoin\n- **Bull/Bear Market**: Same as stocks but much more extreme\n\n**Risks:**\n1. Regulatory risk (government can ban/restrict)\n2. Exchange risk (exchange hacks/failures — FTX in 2022)\n3. Technology risk (bugs in smart contracts)\n4. Scam risk (rug pulls, pump and dump)\n\n**Golden rule**: Never invest more than you can afford to lose ENTIRELY. Most financial advisors recommend 1-5% max allocation.`,
        terms: ["HODL", "DCA", "altcoin", "rug pull", "regulatory risk", "volatility"]
      },
    ],
    quiz: [
      { q: "What makes blockchain immutable?", options: ["Government regulation", "Cryptographic linking of blocks making past records unchangeable", "Centralized database control", "Regular backups"], correct: 2, exp: "Each block contains the hash (fingerprint) of the previous block. Changing any record would require changing ALL subsequent blocks across ALL nodes." },
      { q: "What is the maximum supply of Bitcoin?", options: ["1 million", "10 million", "21 million", "Unlimited"], correct: 2, exp: "Bitcoin has a hard cap of 21 million BTC — this fixed supply is core to its 'digital gold' narrative." },
      { q: "In India, crypto gains are taxed at:", options: ["10%", "20%", "30%", "15%"], correct: 2, exp: "Budget 2022 imposed 30% flat tax on crypto gains with no loss offset allowed against other income." },
      { q: "Ethereum's primary use case is:", options: ["Digital gold/store of value", "Programmable smart contracts and dApps", "Fast payments only", "Mining profitability"], correct: 1, exp: "Ethereum is a programmable blockchain enabling smart contracts, DeFi, NFTs, and decentralized applications." },
      { q: "DCA (Dollar Cost Averaging) in crypto means:", options: ["Buying only when price is low", "Investing a fixed amount at regular intervals regardless of price", "Day trading crypto", "Diversifying across 100 altcoins"], correct: 1, exp: "DCA = invest fixed amount regularly (like SIP for mutual funds). Reduces impact of volatility on average entry price." },
    ]
  },
  {
    id: 11, name: "Portfolio Construction", description: "Asset allocation, diversification, and Sharpe ratio",
    icon: "Layout", color: "#00FF88", bgGrad: "from-emerald-900/40 to-teal-900/40",
    requiredXP: 7000, xpReward: 900, badgeName: "Portfolio Architect",
    lessons: [
      { id: "11-1", title: "Asset Allocation — The Most Important Decision", duration: "9 min", xpReward: 75,
        content: `Studies show that **asset allocation** (how you divide money between stocks, bonds, gold, etc.) determines 90%+ of portfolio returns. Stock picking matters far less!\n\n**Core asset classes:**\n- **Equity**: Stocks/mutual funds — highest return, highest risk\n- **Debt**: Bonds/FDs — stable returns, low risk\n- **Gold**: Inflation hedge, safe haven\n- **Real Estate**: Long-term wealth, illiquid\n- **Cash**: Liquidity, lowest return\n\n**Age-based rule (simplified):**\n- Equity % = 100 - Your Age\n- Age 22: 78% equity, 22% debt\n- Age 50: 50% equity, 50% debt\n- Age 65: 35% equity, 65% debt\n\n**Risk Profiling:**\n1. **Conservative**: 30% equity, 60% debt, 10% gold\n2. **Moderate**: 60% equity, 30% debt, 10% gold\n3. **Aggressive**: 80% equity, 10% debt, 10% gold\n\n**Rebalancing**: Restore target allocation annually. If equities grew from 60% to 75%, sell some equity and buy debt.`,
        terms: ["asset allocation", "equity", "debt", "rebalancing", "risk profiling"]
      },
      { id: "11-2", title: "Diversification — Not All Eggs in One Basket", duration: "8 min", xpReward: 75,
        content: `**Diversification** reduces risk without necessarily reducing returns. Harry Markowitz won the Nobel Prize for proving this mathematically!\n\n**Types of diversification:**\n1. **Across asset classes**: Stocks + bonds + gold\n2. **Across sectors**: IT + Banking + Pharma + FMCG + Auto\n3. **Across market caps**: Large + Mid + Small cap\n4. **Geographic**: India + International funds\n5. **Over time**: SIP (time diversification)\n\n**Correlation**: How two assets move together\n- +1: Move perfectly together (no diversification benefit)\n- 0: No relationship\n- -1: Move in opposite directions (maximum diversification benefit)\n\n**Key insight**: Even within stocks, diversifying across 15-20 stocks removes ~90% of company-specific risk. Beyond 30 stocks, additional diversification benefit is minimal.\n\n**Over-diversification**: Owning 100 stocks or 50 mutual funds is not better than 15-20 well-chosen ones. Quality > Quantity.`,
        terms: ["diversification", "correlation", "sector diversification", "geographic diversification"]
      },
      { id: "11-3", title: "Risk-Adjusted Returns — The Sharpe Ratio", duration: "9 min", xpReward: 100,
        content: `**Risk-adjusted return** = How much return you got per unit of risk taken.\n\n**Sharpe Ratio** = (Portfolio Return - Risk-Free Rate) / Standard Deviation of Returns\n\n- Risk-Free Rate: RBI repo rate / government bond yield (~7% in India)\n- Standard Deviation: Measures volatility/risk of your portfolio\n\n**Interpretation:**\n- Sharpe > 1: Good (earning more than 1 unit of return per unit of risk)\n- Sharpe > 2: Excellent\n- Sharpe < 0: You're better off in an FD!\n\n**Example:**\n- Fund A: 15% return, 20% volatility → Sharpe = (15-7)/20 = 0.4\n- Fund B: 12% return, 8% volatility → Sharpe = (12-7)/8 = 0.625\n- Fund B has BETTER risk-adjusted returns despite lower absolute return!\n\n**Modern Portfolio Theory (MPT)**: The goal is to find the **Efficient Frontier** — portfolios that maximize return for a given level of risk.\n\n**Correlation is key**: Combining assets with low correlation reduces portfolio volatility more than their individual volatilities.`,
        terms: ["Sharpe ratio", "risk-adjusted return", "standard deviation", "efficient frontier", "modern portfolio theory"]
      },
    ],
    quiz: [
      { q: "Asset allocation's contribution to long-term portfolio returns is approximately:", options: ["20-30%", "40-50%", "70-90%", "100%"], correct: 2, exp: "Research shows asset allocation determines 70-90% of portfolio performance. Stock selection and timing are secondary." },
      { q: "For a 25-year-old investor using the '100 minus age' rule, equity allocation should be:", options: ["25%", "50%", "75%", "100%"], correct: 2, exp: "100 - 25 = 75% equity. Young investors can afford more equity risk given their long investment horizon." },
      { q: "Sharpe Ratio measures:", options: ["Absolute returns", "Returns adjusted for risk (return per unit of risk)", "Dividend yield", "Beta of the portfolio"], correct: 1, exp: "Sharpe = (Return - Risk-free rate) / Std Dev. Higher Sharpe = better risk-adjusted performance." },
      { q: "The correlation between gold and equities is typically:", options: ["Strongly positive", "Near zero or slightly negative", "Exactly 1", "Strongly negative always"], correct: 1, exp: "Gold-equity correlation is typically low to negative, making gold a good portfolio diversifier." },
      { q: "Over-diversification (holding 100 stocks) is problematic because:", options: ["It increases volatility", "Additional diversification benefit is negligible; monitoring becomes hard", "SEBI prohibits it", "Taxes become higher"], correct: 1, exp: "Beyond ~20-30 stocks, additional diversification benefit is minimal. Quality research becomes impossible with 100 stocks." },
    ]
  },
  {
    id: 12, name: "Advanced Strategies", description: "Momentum, pairs trading, sector rotation, and algo basics",
    icon: "Code", color: "#6C63FF", bgGrad: "from-indigo-900/40 to-purple-900/40",
    requiredXP: 7900, xpReward: 1000, badgeName: "Strategy Master",
    lessons: [
      { id: "12-1", title: "Momentum vs Mean Reversion", duration: "9 min", xpReward: 75,
        content: `Two opposing philosophies in trading:\n\n**Momentum Strategy**: "Winners keep winning"\n- Buy stocks that have outperformed recently (past 6-12 months)\n- Based on behavioral finance: herding, investor underreaction\n- Works best in trending markets\n- **Risk**: Momentum can reverse violently ("momentum crash")\n\n**Mean Reversion Strategy**: "Everything reverts to average"\n- Buy stocks that have fallen significantly below their average\n- Sell stocks that have risen significantly above their average\n- Based on the idea that extreme prices normalize over time\n- Works best in range-bound markets\n\n**Indian market evidence:**\n- Nifty Momentum 50 index has historically outperformed Nifty 50\n- Mean reversion works well for Nifty options (selling high IV before earnings)\n\n**Combining both**: Many quant funds use momentum for entry and mean reversion for exit signals. The holy grail is knowing WHICH strategy to apply WHEN.`,
        terms: ["momentum", "mean reversion", "behavioral finance", "quant strategy"]
      },
      { id: "12-2", title: "Pairs Trading — Relative Value", duration: "9 min", xpReward: 75,
        content: `**Pairs Trading** is a market-neutral strategy that profits from the relative price movement between two correlated assets.\n\n**Concept:**\nHDFC Bank and ICICI Bank typically move together. If HDFC rises 5% while ICICI rises only 2%, the spread widened.\n- **Trade**: SELL HDFC Bank (overvalued relative to ICICI), BUY ICICI Bank (undervalued relative)\n- **Profit when**: The spread reverts to normal\n\n**Steps:**\n1. Find a correlated pair (same sector helps)\n2. Calculate the historical spread/ratio\n3. Buy the underperformer, sell the outperformer when spread widens\n4. Close when spread normalizes\n\n**Famous Indian pairs:**\n- HDFC Bank vs ICICI Bank\n- Infosys vs TCS\n- ONGC vs Reliance Industries\n\n**Why it's market-neutral:**\n- If entire market crashes, both positions lose equally\n- You profit only from the RELATIVE movement, not market direction\n- Much lower market risk than directional trades\n\n**Stat arb**: Advanced quant funds use statistical models to trade hundreds of pairs simultaneously.`,
        terms: ["pairs trading", "market neutral", "spread", "statistical arbitrage", "correlation"]
      },
      { id: "12-3", title: "Sector Rotation — Following the Business Cycle", duration: "9 min", xpReward: 100,
        content: `**Sector rotation** is the movement of investment money between different sectors as the economic cycle progresses.\n\n**Business cycle phases and leading sectors:**\n1. **Recovery** (growth picking up): Financials, consumer discretionary, IT\n2. **Expansion** (peak growth): Energy, materials, industrials\n3. **Slowdown** (growth peaking): Healthcare, utilities, consumer staples\n4. **Recession** (growth declining): Gold, government bonds, cash\n\n**Indian sector cycle examples:**\n- 2020 recovery: IT and pharma led (WFH + COVID vaccines)\n- 2021-22 expansion: Capital goods, metals, real estate boomed\n- 2023-24: Financials and auto led consumer recovery\n\n**How to use it:**\n- Track macroeconomic indicators (GDP, IIP, PMI, inflation)\n- Read RBI monetary policy statements\n- Monitor FII flows into different sectors\n- Use Nifty sector indices (Nifty IT, Nifty Bank, Nifty Pharma)\n\n**Connection to Algo Lab:**\nSector rotation strategies can be automated using momentum signals on sector ETFs!`,
        terms: ["sector rotation", "business cycle", "macroeconomic indicators", "PMI", "FII flows"]
      },
    ],
    quiz: [
      { q: "Momentum strategy is based on the principle:", options: ["Buy low, sell high", "Recent outperformers tend to continue outperforming", "Mean reversion always happens", "Diversify across sectors"], correct: 1, exp: "Momentum = winners keep winning (at least for a while). Backed by behavioral finance research." },
      { q: "In pairs trading (HDFC Bank vs ICICI Bank), if HDFC rises much more than ICICI, you would:", options: ["Buy both", "Buy HDFC, sell ICICI", "Sell HDFC, buy ICICI", "Hold cash"], correct: 2, exp: "When HDFC outperforms (spread widens), sell the relative outperformer (HDFC) and buy the underperformer (ICICI)." },
      { q: "During an economic recession, which sector typically outperforms?", options: ["Real estate", "Consumer discretionary", "Utilities and healthcare (defensive sectors)", "Banking"], correct: 2, exp: "Defensive sectors (utilities, healthcare, consumer staples) hold value better in recessions as demand is inelastic." },
      { q: "Pairs trading is considered 'market neutral' because:", options: ["It involves equal investment in both positions", "It profits from relative movement, not market direction", "It uses derivatives for hedging", "It only trades index futures"], correct: 1, exp: "Pairs trading profits from the spread between two correlated assets, not from market direction. Both longs and shorts balance out." },
      { q: "Which indicator is most useful for sector rotation?", options: ["Candlestick patterns", "PMI, GDP growth, and RBI monetary policy signals", "52-week highs/lows", "Company EPS"], correct: 1, exp: "Sector rotation follows the business cycle. PMI (manufacturing activity), GDP, and RBI policy changes signal where we are in the cycle." },
    ]
  },
];

export const GLOSSARY_TERMS = [
  { term: "Alpha", definition: "Excess return above a benchmark. If Nifty returns 12% and your fund returns 15%, alpha is 3%.", category: "Performance" },
  { term: "Beta", definition: "Measure of stock volatility vs market. Beta > 1 = more volatile than market. Beta < 1 = less volatile.", category: "Risk" },
  { term: "Bull Market", definition: "Rising market; generally when major indices rise 20%+ from recent lows.", category: "Markets" },
  { term: "Bear Market", definition: "Falling market; generally when major indices fall 20%+ from recent highs.", category: "Markets" },
  { term: "CAGR", definition: "Compound Annual Growth Rate — smoothed annual growth rate. Better than simple average for investment returns.", category: "Returns" },
  { term: "Circuit Breaker", definition: "NSE/BSE halt trading when Nifty falls 10%, 15%, or 20% in a day.", category: "Trading" },
  { term: "Demat Account", definition: "Electronic account that holds your shares and securities in dematerialized form. Required to trade in India.", category: "Accounts" },
  { term: "ELSS", definition: "Equity Linked Savings Scheme — tax-saving mutual fund under Sec 80C with 3-year lock-in.", category: "Tax" },
  { term: "FII/FPI", definition: "Foreign Institutional Investors/Foreign Portfolio Investors. Their buying/selling heavily impacts Indian markets.", category: "Market Participants" },
  { term: "F&O", definition: "Futures & Options — derivatives segment on NSE/BSE. Higher risk than cash equities.", category: "Derivatives" },
  { term: "Free Float", definition: "Portion of company shares available for public trading (excluding promoter holdings).", category: "Stocks" },
  { term: "Fundamental Analysis", definition: "Analyzing a company's financial health, business model, and growth prospects to determine intrinsic value.", category: "Analysis" },
  { term: "Grey Market Premium", definition: "GMP shows expected IPO listing price premium in the unofficial grey market.", category: "IPO" },
  { term: "HNI", definition: "High Net Worth Individual — person with investable assets of ₹5 crore+.", category: "Investors" },
  { term: "Index Fund", definition: "Mutual fund that passively tracks an index like Nifty 50. Very low expense ratio.", category: "Mutual Funds" },
  { term: "Intrinsic Value", definition: "The 'true' value of a stock based on its fundamentals, irrespective of market price.", category: "Valuation" },
  { term: "IPO", definition: "Initial Public Offering — first time a company sells shares to the public.", category: "Markets" },
  { term: "LTCG", definition: "Long Term Capital Gains tax — 12.5% on equity gains > ₹1.25 lakh after holding > 1 year.", category: "Tax" },
  { term: "Margin", definition: "Collateral deposited with broker to trade derivatives. Losses can exceed margin deposited.", category: "Derivatives" },
  { term: "Market Cap", definition: "Total market value of a company = Share Price × Outstanding Shares.", category: "Stocks" },
  { term: "Nifty 50", definition: "Index of 50 largest companies on NSE representing major sectors of Indian economy.", category: "Indices" },
  { term: "Open Interest", definition: "Total outstanding futures/options contracts not yet settled. Indicates market activity.", category: "Derivatives" },
  { term: "P/E Ratio", definition: "Price-to-Earnings ratio = Market Price / EPS. Shows how much investors pay per rupee of earnings.", category: "Valuation" },
  { term: "Portfolio", definition: "Collection of financial assets (stocks, bonds, mutual funds) owned by an investor.", category: "Investment" },
  { term: "Rupee Cost Averaging", definition: "Investing fixed amount regularly. Buys more units when prices fall and fewer when they rise.", category: "Strategy" },
  { term: "SEBI", definition: "Securities and Exchange Board of India — regulator for Indian capital markets.", category: "Regulatory" },
  { term: "SIP", definition: "Systematic Investment Plan — invest fixed amount in mutual funds at regular intervals.", category: "Mutual Funds" },
  { term: "STCG", definition: "Short Term Capital Gains — 20% tax on equity gains when held less than 1 year.", category: "Tax" },
  { term: "Technical Analysis", definition: "Predicting future price movements by studying historical price and volume data.", category: "Analysis" },
  { term: "Volatility", definition: "Degree of price fluctuation in a security. High volatility = bigger swings, higher risk.", category: "Risk" },
];

export const ARTICLES = [
  {
    id: 1, title: "Warren Buffett's 5 Golden Rules for Beginners",
    category: "Strategy", level: "Beginner", readTime: "5 min",
    excerpt: "The Oracle of Omaha's timeless wisdom distilled for Indian investors just starting their journey.",
    content: "Rule 1: Never lose money. Rule 2: Never forget Rule 1..."
  },
  {
    id: 2, title: "How to Analyze an Indian Company in 10 Minutes",
    category: "Fundamental Analysis", level: "Intermediate", readTime: "8 min",
    excerpt: "A quick framework for evaluating NSE-listed companies using publicly available data.",
    content: "Step 1: Check the business model..."
  },
  {
    id: 3, title: "Nifty 50 vs Sensex: What's the Difference?",
    category: "Markets", level: "Beginner", readTime: "4 min",
    excerpt: "Both track India's top companies — but there are key differences every investor must know.",
    content: "NSE's Nifty 50 and BSE's Sensex are India's two primary benchmark indices..."
  },
  {
    id: 4, title: "Building Your First SIP Portfolio from Scratch",
    category: "Mutual Funds", level: "Beginner", readTime: "10 min",
    excerpt: "A step-by-step guide for college students to start investing with just ₹500/month.",
    content: "Step 1: Open a demat + mutual fund account..."
  },
  {
    id: 5, title: "Understanding India VIX — The Fear Index",
    category: "Technical Analysis", level: "Intermediate", readTime: "6 min",
    excerpt: "What India VIX tells you about market sentiment and how to use it in your trading.",
    content: "India VIX measures expected market volatility..."
  },
  {
    id: 6, title: "RBI Rate Hikes: How They Affect Your Stocks",
    category: "Economy", level: "Intermediate", readTime: "7 min",
    excerpt: "Every RBI policy decision impacts your portfolio. Here's exactly how and which sectors to watch.",
    content: "When RBI raises the repo rate..."
  },
];

export const INVESTOR_QUOTES = [
  { quote: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett", role: "CEO, Berkshire Hathaway" },
  { quote: "In the short run, the market is a voting machine. In the long run, it's a weighing machine.", author: "Benjamin Graham", role: "Father of Value Investing" },
  { quote: "Know what you own, and know why you own it.", author: "Peter Lynch", role: "Former Manager, Magellan Fund" },
  { quote: "The four most dangerous words in investing are: 'This time it's different.'", author: "John Templeton", role: "Pioneer, Global Investing" },
  { quote: "Buy when everyone else is selling and hold until everyone else is buying.", author: "J. Paul Getty", role: "Oil Billionaire" },
  { quote: "I made my money by selling too soon.", author: "Bernard Baruch", role: "American Financier" },
  { quote: "The best investment you can make is in yourself.", author: "Warren Buffett", role: "CEO, Berkshire Hathaway" },
  { quote: "Behind every stock is a company. Find out what it's doing.", author: "Peter Lynch", role: "Former Manager, Magellan Fund" },
];

export const BADGES = [
  { id: "first_login", name: "First Step", description: "Joined Optimus", icon: "Star", color: "#FFB800" },
  { id: "first_trade", name: "First Trade", description: "Placed first paper trade", icon: "TrendingUp", color: "#00FF88" },
  { id: "town_1_master", name: "Money Mind", description: "Completed Money Basics", icon: "Coins", color: "#6C63FF" },
  { id: "town_2_master", name: "Market Explorer", description: "Mastered Stock Market 101", icon: "BarChart2", color: "#00D4FF" },
  { id: "town_3_master", name: "First Trader", description: "Mastered Equity Trading", icon: "Activity", color: "#00FF88" },
  { id: "town_4_master", name: "Value Analyst", description: "Mastered Fundamental Analysis", icon: "FileText", color: "#FFB800" },
  { id: "town_5_master", name: "Chart Wizard", description: "Mastered Technical Analysis", icon: "TrendingUp", color: "#6C63FF" },
  { id: "town_6_master", name: "SIP Master", description: "Mastered Mutual Funds", icon: "PieChart", color: "#FF8C00" },
  { id: "town_7_master", name: "Futures Trader", description: "Mastered Futures", icon: "Zap", color: "#FF4444" },
  { id: "town_8_master", name: "Options Guru", description: "Mastered Options", icon: "GitBranch", color: "#9B59B6" },
  { id: "town_9_master", name: "Commodity Trader", description: "Mastered Commodities", icon: "Gem", color: "#F4A460" },
  { id: "town_10_master", name: "Crypto Explorer", description: "Mastered Cryptocurrency", icon: "Cpu", color: "#F7931A" },
  { id: "town_11_master", name: "Portfolio Architect", description: "Mastered Portfolio Construction", icon: "Layout", color: "#00FF88" },
  { id: "town_12_master", name: "Strategy Master", description: "Mastered Advanced Strategies", icon: "Code", color: "#6C63FF" },
];

export const INFO_DEFINITIONS = {
  "P/E Ratio": { definition: "Price-to-Earnings ratio compares a company's stock price to its earnings per share.", formula: "P/E = Market Price per Share / Earnings per Share", example: "TCS at ₹3,789 with EPS ₹100 = P/E of 37.9. This means investors pay ₹37.9 for every ₹1 of earnings. Nifty 50 average P/E is 20-25." },
  "EPS": { definition: "Earnings Per Share — the portion of a company's profit allocated to each outstanding share.", formula: "EPS = Net Profit / Total Outstanding Shares", example: "Infosys net profit ₹26,248 Cr with 4,200 Cr shares = EPS ≈ ₹62.5 per share." },
  "ROE": { definition: "Return on Equity measures how efficiently a company uses shareholders' money to generate profit.", formula: "ROE = Net Profit / Shareholders' Equity × 100", example: "TCS ROE ~50% means for every ₹100 of shareholder equity, TCS earns ₹50 profit annually. Excellent!" },
  "RSI": { definition: "Relative Strength Index is a momentum indicator that measures overbought/oversold conditions on a scale of 0-100.", formula: "RSI = 100 - (100 / (1 + Average Gain / Average Loss))", example: "If Nifty RSI is at 78, it's overbought — market has risen quickly and may correct soon." },
  "MACD": { definition: "Moving Average Convergence Divergence identifies momentum changes by comparing two exponential moving averages.", formula: "MACD Line = 12-day EMA - 26-day EMA; Signal Line = 9-day EMA of MACD", example: "When MACD crosses above Signal Line, it's a bullish signal. HDFC Bank MACD crossover in Oct 2023 preceded a 15% rally." },
  "Bollinger Bands": { definition: "Volatility bands placed above and below a moving average. Shows when prices are statistically high or low.", formula: "Upper = SMA(20) + 2×StdDev; Lower = SMA(20) - 2×StdDev", example: "When Nifty touches lower Bollinger Band, it has historically been a mean-reversion buying opportunity." },
  "Sharpe Ratio": { definition: "Measures risk-adjusted return — how much excess return you earn for each unit of risk taken.", formula: "Sharpe = (Portfolio Return - Risk-free Rate) / Standard Deviation", example: "A fund returning 15% with 10% volatility and 7% risk-free rate has Sharpe = (15-7)/10 = 0.8. Above 1 is considered good." },
  "Market Cap": { definition: "Total market value of a company's outstanding shares.", formula: "Market Cap = Current Share Price × Total Outstanding Shares", example: "Reliance Industries at ₹2,456 × 1,348 Cr shares = ₹33.1 Lakh Crore market cap — India's most valuable company!" },
  "NAV": { definition: "Net Asset Value is the price of one unit of a mutual fund.", formula: "NAV = (Total Assets - Liabilities) / Number of Units", example: "HDFC Index Fund NAV ₹542. Buy 100 units = ₹54,200 invested. If NAV rises to ₹600, your investment is worth ₹60,000." },
  "SIP": { definition: "Systematic Investment Plan — invest a fixed amount in mutual funds at regular intervals.", formula: "M = P × [((1+r)^n - 1)/r] × (1+r) where P=monthly amount, r=monthly rate, n=months", example: "₹5,000/month SIP at 12% for 10 years: Total invested = ₹6L, but you accumulate ₹11.6L thanks to compounding!" },
};
