package com.goodow.drive.server.proxy;

import com.google.appengine.api.urlfetch.HTTPHeader;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.common.base.Preconditions;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A servlet that proxies HTTP requests synchronously to another URL.
 */
public final class ProxyHandler extends HttpServlet {
  private static final Logger log = Logger.getLogger(ProxyHandler.class.getName());

  public static void copyResponse(HTTPResponse from, HttpServletResponse to) throws IOException {
    to.setStatus(from.getResponseCode());
    for (HTTPHeader header : from.getHeaders()) {
      to.setHeader(header.getName(), header.getValue());
    }
    copy(new ByteArrayInputStream(from.getContent()), to.getOutputStream());
  }

  /**
   * Transfers one stream to another. Raw streams are used rather than string-based readers/writers
   * in case the byte format of the streams is not UTF-16.
   * 
   * @return output, for convenience.
   */
  private static <T extends OutputStream> T copy(InputStream input, T output) throws IOException {
    byte[] buffer = new byte[8192];
    int read;
    while ((read = input.read(buffer, 0, buffer.length)) > 0) {
      output.write(buffer, 0, read);
    }
    output.flush();
    return output;
  }

  /** Part of incoming requests to rewrite. e.g., "/gadgets". */
  private final String sourceUriPrefix;

  /** Value on which to rebase incoming URLs. e.g., "http://gmodules.com". */
  private final String targetUriPrefix;

  /** Fetch service. Used in favor of HttpURLConnection for greater control. */
  private final URLFetchService fetch;

  /**
   * Creates a proxy servlet.
   * 
   * @param sourceUriPrefix prefix of incoming requests to rewrite
   * @param targetUriPrefix value to replace the source prefix
   * @param fetch
   */
  public ProxyHandler(String sourceUriPrefix, String targetUriPrefix, URLFetchService fetch) {
    // To prevent silly things like fowarding to ../
    Preconditions.checkArgument(!targetUriPrefix.contains(".."));
    this.sourceUriPrefix = sourceUriPrefix;
    this.targetUriPrefix = targetUriPrefix;
    this.fetch = fetch;
  }

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    proxy(req, resp);
  }

  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    proxy(req, resp);
  }

  public void proxy(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!req.getRequestURI().startsWith(sourceUriPrefix)) {
      log.info("Not proxying request to " + req.getRequestURI() + ", does not start with "
          + sourceUriPrefix);
      return;
    }
    String sourceUri = req.getRequestURI();
    String query = req.getQueryString() != null ? "?" + req.getQueryString() : "";
    String targetUri = targetUriPrefix + sourceUri.substring(sourceUriPrefix.length()) + query;
    log.info("Forwarding request: " + sourceUri + query + " to " + targetUri);

    HTTPMethod fetchMethod = HTTPMethod.valueOf(req.getMethod());
    HTTPRequest fetchRequest = new HTTPRequest(new URL(targetUri), fetchMethod);
    // StringBuilder sb = new StringBuilder();
    for (@SuppressWarnings("unchecked")
    Enumeration<String> headers = req.getHeaderNames(); headers.hasMoreElements();) {
      String headerName = headers.nextElement();
      String headerValue = req.getHeader(headerName);
      // sb.append(headerName + ": " + headerValue).append("\n");
      fetchRequest.addHeader(new HTTPHeader(headerName, headerValue));
    }
    // log.info("Headers\n" + sb.toString());
    if (fetchMethod != HTTPMethod.GET) {
      fetchRequest
          .setPayload(copy(req.getInputStream(), new ByteArrayOutputStream()).toByteArray());
      if (req.getRequestURI().startsWith(sourceUriPrefix + "api")) {
        fetchRequest.setHeader(new HTTPHeader("Content-Type", "application/json"));
      }
    }
    HTTPResponse fetchResponse = fetch.fetch(fetchRequest);
    copyResponse(fetchResponse, resp);
  }
}
