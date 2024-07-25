# BOSE Benchmarks

## Performance Assessment of the BSV Overlay Services Engine

Babbage has conducted a performance assessment of the BSV Overlay Services Engine, focusing on the number of transactions processed per second. The benchmarking methodology incorporates multiple variables that significantly impact the system's performance. These variables include:

- **Application Specific Topical Admittance Checks:** The CPU time, degree of optimization, and resources required by specific topical admittance checking logic, which varies by application. Simpler checks improved performance.
- **Round Trip Time:** The round trip time between the Overlay Services Engine and its data storage layer. Lower latencies improved performance.
- **Data Storage Layer Optimizations:** The presence or absence of indices, caches, or other optimizations at the data storage layer. Adding indices improved performance.
- **SPV Verification and Chain Tracker:** The choice of chain tracker for SPV verification and any associated rate limits.
- **Transaction Broadcaster:** The transaction broadcaster used, if any, and applicable rate limits.
- **Transaction Propagation Nodes:** The number of other nodes configured for transaction propagation for any given transaction is likely to impact performance.
- **Previous Coin Consumption:** The presence or absence of previous coins consumed by any given transaction.
- **System CPU Performance:** The single-core CPU performance of the system on which the Engine is executed.

Performance metrics were collected with various combinations of these variables to provide a broad view of the system's capabilities.

## Testing Methodology

All results are based on tests conducted with a clean initial database. Each test measures the time taken to submit and fully process 1,000 transactions through the system. No transaction consumes coins created by a previous one, and the time taken to create and sign the transactions was not measured.

## Test Configurations and Results

- **Local Test (No Broadcaster, No ChainTracker, No Admittance Check)**
  - Total Time: 6,788.769 ms
  - Transactions per Second (tx/sec): 147.302

- **Local Test (ARC Broadcaster, No ChainTracker, No Admittance Check)**
  - Total Time: 9,993.201 ms
  - Transactions per Second (tx/sec): 100.068

- **Local Test (ARC Broadcaster, WoC ChainTracker, No Admittance Check)**
  - Total Time: 347,771.367 ms
  - Transactions per Second (tx/sec): 2.875

- **Local Test (No Broadcaster, No ChainTracker, HelloWorld Admittance Check)**
  - Total Time: 14,565.443 ms
  - Transactions per Second (tx/sec): 68.656

- **Cloud Test (GCR, WoC ChainTracker, 1000tx batched 100tx per batch)**
  - Total Time: 437,232 ms
  - Transactions per Second (tx/sec): 2.3

- **Local Test (Default Overlay Example Setup)**
  - Total Time: 313,146.133 ms
  - Transactions per Second (tx/sec): 3.193

- **Local Test (Default Overlay Example, 'Scripts Only' ChainTracker)**
  - Total Time: 347,058.117 ms
  - Transactions per Second (tx/sec): 2.881

These results highlight the significant variation in transaction processing speeds based on the configuration of the Overlay Services Engine. The following analysis delves deeper into the impact of each variable and offers insights into potential optimizations for improving system performance.


## Performance Analysis of BSV Overlay Services Engine

The performance of the BSV Overlay Services Engine has been assessed under various configurations, with results indicating significant variation in transaction processing speeds based on the combination of components and settings used. Below is an analysis of the performance metrics provided, broken down by key components and variables.

### 1. Base Performance without Broadcaster, Chaintracker, or Topical Admittance Check

- **Total Time:** 6788.769 ms
- **Transactions per Second (tx/sec):** 147.302

This test serves as a baseline, representing the highest performance scenario where no additional overhead from broadcasters, ChainTrackers, or admittance checks is present.

### 2. Impact of ARC Broadcaster

- **Total Time:** 9993.201 ms
- **Transactions per Second (tx/sec):** 100.068

Introducing the ARC broadcaster results in a decrease in performance, suggesting that the broadcaster introduces significant overhead. The transaction rate drops by approximately 32% compared to the baseline.

Offloading this work onto another thread with Node Worker processes could help maintain performance on the main thread.

### 3. Impact of WoC Chaintracker with ARC Broadcaster

- **Total Time:** 347771.367 ms
- **Transactions per Second (tx/sec):** 2.875

Adding the WoC ChainTracker (and the SPV checks with script evaluation) drastically reduces performance, with a 98% decrease in transactions per second compared to using only the ARC broadcaster. This indicates that the SPV verification process is a major bottleneck.

Optimizing the script evaluation process, including moving the BSV TypeScript SDK’s script interpreter onto a Node Worker process is likely to significantly enhance performance on the main thread.

### 4. Impact of HelloWorld Topical Admittance Check

- **Total Time:** 14565.443 ms
- **Transactions per Second (tx/sec):** 68.656

Including the HelloWorld topical admittance check also significantly reduces performance, but less drastically than the WoC ChainTracker. The transaction rate is about 53% lower than the baseline, highlighting the cost of additional admittance logic.

### 5. Cloud Performance (GCR with WoC Chaintracker)

- **Total Time:** 437232 ms
- **Transactions per Second (tx/sec):** 2.3

Running the engine in the cloud with the WoC ChainTracker shows the lowest performance, even lower than local tests with the same ChainTracker. This suggests additional latency or resource constraints in the cloud environment.

### 6. Default Setup of Overlay-Example

- **Total Time:** 313146.133 ms
- **Transactions per Second (tx/sec):** 3.193

The default setup of the overlay-example provides a baseline for real-world scenarios. The performance is similar to using the WoC ChainTracker, indicating this is a typical configuration's expected performance.

### 7. Default Setup with 'Scripts Only' Chaintracker

- **Total Time:** 347058.117 ms
- **Transactions per Second (tx/sec):** 2.881

Using 'scripts only' for the ChainTracker does not significantly alter performance compared to the WoC ChainTracker, implying that the bottleneck is within the wider SPV verification logic (TypeScript SDK script interpreter consuming CPU time) rather than specific ChainTracker implementation details.

## Component-by-Component Performance Implications

### CPU Time and Single-Core Performance

- The baseline test demonstrates the highest throughput, emphasizing the importance of minimizing additional processing overhead to maximize CPU efficiency. This can be achieved by moving processing onto other threads, away from the main thread.

### Broadcaster

- The introduction of a broadcaster reduces performance, suggesting that the process of broadcasting transactions to the network is resource-intensive. Optimizations in this area could yield significant performance gains, such as moving the process to a Worker.

### Chaintracker and SPV Validation

- The process of evaluating the necessary scripts for SPV checking has a dramatic impact on performance, indicating that chain-of-custody verification processes on BEEF input transactions are highly resource-intensive. Efforts to optimize or streamline these processes are crucial.

### Topical Admittance Check

- The HelloWorld topical admittance check also introduces significant overhead. Admittance checks should be carefully designed to balance security and performance. This is done on a topic-by-topic basis.

### Cloud Environment

- Performance in the cloud is lower than local tests, suggesting that factors such as network latency, cloud resource allocation, and infrastructure play a significant role. Optimizing cloud configurations could improve performance.

The performance of the BSV Overlay Services Engine is highly sensitive to the configuration of its components. Broadcasters, ChainTrackers, and topical admittance checks all introduce significant overhead. Optimizing these components and considering the deployment environment (local vs. cloud) are key to achieving higher transaction processing rates.