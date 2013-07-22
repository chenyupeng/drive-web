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

import com.google.inject.Singleton;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

@Singleton
public class LocalDevServerFilter implements Filter {

  private static final String APPLICATION_JSON = "application/json";

  @Override
  public void destroy() {
  }

  @Override
  public void doFilter(ServletRequest req, ServletResponse resp, FilterChain filterChain)
      throws IOException, ServletException {
    HttpServletRequest request = (HttpServletRequest) req;
    String contentType = request.getContentType();
    if (request.getMethod() == "POST" && contentType != null
        && !contentType.toLowerCase().startsWith(APPLICATION_JSON)) {
      req = new HttpServletRequestWrapper(request) {
        @Override
        public String getContentType() {
          return APPLICATION_JSON;
        }
      };
    }
    filterChain.doFilter(req, resp);
    ((HttpServletResponse) resp).setHeader("Access-Control-Allow-Origin", "*");
  }

  @Override
  public void init(FilterConfig arg0) throws ServletException {
  }

}
