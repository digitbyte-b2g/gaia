!(function (exports) {
  'use strict';

  var ChildProcess = {
    shell: '/usr/bin/bash',

    exec: function exec(command, args = '', shell) {
      // use the specified shell
      if (!shell) {
        shell = this.shell;
      }

      // create a new WebSocket connection
      const socket = new WebSocket('ws://127.0.0.1:7703');

      // handle the connection open event
      socket.onopen = () => {
        // Send the command to start a shell.
        console.log(`Setting shell to '${shell}'`);
        socket.send(shell);

        // send the command to the server
        socket.send(command + ' ' + args);
      };

      // handle the message event
      socket.onmessage = (event) => {
        // display the output of the command
        console.log(event.data);
      };

      // handle the error event
      socket.onerror = (error) => {
        console.error(`WebSocket error: ${error}`);
      };

      // handle the connection close event
      socket.onclose = (event) => {
        console.log(`WebSocket closed with code ${event.code}`);
      };
    },

    kill: function kill(pid) {
      // create a new WebSocket connection
      const socket = new WebSocket('ws://127.0.0.1:7703');

      // handle the connection open event
      socket.onopen = () => {
        // send the kill command to the server
        socket.send(`kill -9 ${pid}`);
      };

      // handle the message event
      socket.onmessage = (event) => {
        // display the output of the command
        console.log(event.data);
      };

      // handle the error event
      socket.onerror = (error) => {
        console.error(`WebSocket error: ${error}`);
      };

      // handle the connection close event
      socket.onclose = (event) => {
        console.log(`WebSocket closed with code ${event.code}`);
      };
    },

    list: function list() {
      return new Promise((resolve, reject) => {
        // create a new WebSocket connection
        const socket = new WebSocket('ws://127.0.0.1:7703');

        // handle the connection open event
        socket.onopen = () => {
          // send the list command to the server
          socket.send('ps -eo pid,comm,%cpu,%mem,%mem_rss,%mem_vsz');

          // create an empty array to store the process information
          const processes = [];

          // handle the message event
          socket.onmessage = (event) => {
            // split the output into lines and process each line
            const lines = event.data.trim().split('\n');
            for (let i = 1; i < lines.length; i++) {
              // extract the PID, name, CPU usage, and memory usage from the line
              const [pid, name, cpu, mem, mem_rss, mem_vsz] = lines[i].trim().split(/\s+/);

              // convert memory usage to bytes
              const mem_bytes = mem_rss * 1024;

              // add the process information to the array
              processes.push({ pid: pid, name: name, cpu: cpu, memory: mem_bytes });
            }

            // send the network command to the server
            socket.send('cat /proc/net/dev');

            // handle the message event for network data
            socket.onmessage = (event) => {
              // split the output into lines and process each line
              const lines = event.data.trim().split('\n');
              for (let i = 2; i < lines.length; i++) {
                // extract the interface name, network download, and network upload information
                const [iface, rx, _, _, _, _, _, _, _, tx, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _] = lines[i].trim().split(/\s+/);

                // convert network data to bytes
                const rx_bytes = rx * 8;
                const tx_bytes = tx * 8;

                // find the process that has this interface as its name
                const proc = processes.find((p) => p.name === iface);

                // if we found a matching process, add the network data to its information
                if (proc) {
                  proc.network_receive = rx_bytes;
                  proc.network_transmit = tx_bytes;
                }
              }

              // send the disk command to the server
              socket.send('cat /proc/diskstats');

              // handle the message event for disk data
              socket.onmessage = (event) => {
                // split the output into lines and process each line
                const lines = event.data.trim().split('\n');
                for (let i = 0; i < lines.length; i++) {
                  // extract the device name, read and write information from the line
                  const [major, minor, device, reads, merged_reads, sectors_read, ms_reading, writes, merged_writes, sectors_written, ms_writing, io_in_progress, ms_doing_io, weighted_ms_doing_io] = lines[i].trim().split(/\s+/);

                  // convert disk data to bytes
                  const read_bytes = sectors_read * 512;
                  const write_bytes = sectors_written * 512;

                  // find the process that has this device as its name
                  const proc = processes.find((p) => p.name === device);

                  // if we found a matching process, add the disk data to its information
                  if (proc) {
                    proc.disk_minor = minor;
                    proc.disk_major = major;
                    proc.disk_reads = reads;
                    proc.disk_merged_reads = merged_reads;
                    proc.disk_read = read_bytes;
                    proc.disk_ms_reading = ms_reading;
                    proc.disk_writes = writes;
                    proc.disk_merged_writes = merged_writes;
                    proc.disk_write = write_bytes;
                    proc.disk_ms_writing = ms_writing;
                    proc.disk_io_in_progress = io_in_progress;
                    proc.disk_ms_doing_io = ms_doing_io;
                    proc.disk_weighted_ms_doing_io = weighted_ms_doing_io;
                  }

                  resolve(processes);
                }
              }
            }
          }
        }
      });
    }
  };

  exports.ChildProcess = ChildProcess;
})(window);
