/*
 * Copyright 2012 Goodow.com
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
package com.goodow.drive.server.proxy;

import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.utils.SystemProperty;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Singleton
public class ProxyFilter implements Filter {
  private static final Logger log = Logger.getLogger(ProxyFilter.class.getName());
  /** Configured proxy. */
  private final ProxyHandler delegate;
  public static final String PROXY_PATH = "/ah/";

  @Inject
  ProxyFilter(URLFetchService fetchService) {
    delegate =
        new ProxyHandler(PROXY_PATH, "https://" + SystemProperty.applicationId.get()
            + ".appspot.com/_ah/", fetchService);
  }

  @Override
  public void destroy() {
  }

  @Override
  public void doFilter(ServletRequest req, ServletResponse resp, FilterChain filterChain)
      throws IOException, ServletException {
    if (req.getServerName().endsWith(".goodow.com")) {
      delegate.proxy((HttpServletRequest) req, (HttpServletResponse) resp);
      return;
    }
    filterChain.doFilter(req, resp);
  }

  @Override
  public void init(FilterConfig arg0) throws ServletException {
  }

}
