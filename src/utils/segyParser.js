// SEG-Y file parser
export class SEGYParser {
    constructor(arrayBuffer) {
        this.buffer = arrayBuffer;
        this.view = new DataView(arrayBuffer);
    }

    parseTextHeader() {
        const decoder = new TextDecoder('ascii');
        const textHeader = decoder.decode(this.buffer.slice(0, 3200));
        return textHeader;
    }

    parseBinaryHeader() {
        const header = {
            jobId: this.view.getInt32(3200),
            lineNumber: this.view.getInt32(3204),
            reelNumber: this.view.getInt32(3208),
            numTraces: this.view.getInt16(3212),
            numAuxTraces: this.view.getInt16(3214),
            sampleInterval: this.view.getInt16(3216),
            samplesPerTrace: this.view.getInt16(3220),
            dataFormat: this.view.getInt16(3224)
        };
        return header;
    }

    parseTraceHeader(offset) {
        return {
            traceNumber: this.view.getInt32(offset),
            inline: this.view.getInt32(offset + 188),
            crossline: this.view.getInt32(offset + 192),
            numSamples: this.view.getInt16(offset + 114)
        };
    }

    parseTraceData(offset, numSamples, format) {
        const data = [];
        let sampleSize = 4; // Default for IEEE float

        for (let i = 0; i < numSamples; i++) {
            const value = this.view.getFloat32(offset + i * sampleSize, false);
            data.push(value);
        }

        return data;
    }

    parse() {
        const textHeader = this.parseTextHeader();
        const binaryHeader = this.parseBinaryHeader();
        const traces = [];

        let offset = 3600; // Start of trace data
        const traceHeaderSize = 240;
        const traceDataSize = binaryHeader.samplesPerTrace * 4;

        while (offset < this.buffer.byteLength) {
            const traceHeader = this.parseTraceHeader(offset);
            const traceData = this.parseTraceData(
                offset + traceHeaderSize,
                traceHeader.numSamples,
                binaryHeader.dataFormat
            );

            traces.push({
                header: traceHeader,
                data: traceData
            });

            offset += traceHeaderSize + traceDataSize;
        }

        return {
            textHeader,
            binaryHeader,
            traces
        };
    }
}
