package com.netcracker.cdt.collector.common.transport;

public class ProfilerProtocolException extends RuntimeException {
    public ProfilerProtocolException(String message) {
        super(message);
    }

    public ProfilerProtocolException(String message, Throwable cause) {
        super(message, cause);
    }

    public ProfilerProtocolException(Throwable cause) {
        super(cause);
    }
}
