/**
 * PageUtils - 通用列表页工具库
 * 提取各页面重复的表格、筛选、分页、弹窗等逻辑
 * ES5 语法，零依赖
 */
var PageUtils = (function() {
  'use strict';

  // ===== 1. 状态标签 =====
  function statusTag(status, configMap) {
    var cfg = (configMap || {})[status];
    if (!cfg) return '<span class="tag tag-gray">未知</span>';
    return '<span class="tag ' + (cfg.cls || 'tag-gray') + '">' + cfg.label + '</span>';
  }

  // ===== 2. 状态筛选栏（事件委托，无 onclick） =====
  var StatusFilter = {
    current: 'all',
    onChange: null,
    render: function(containerId, config, data, options) {
      options = options || {};
      var bar = document.getElementById(containerId);
      if (!bar) return;
      var field = options.statusField || 'status';
      var counts = { all: data.length };
      Object.keys(config).forEach(function(key) {
        if (key === 'all') return;
        counts[key] = data.filter(function(d) { return d[field] === key; }).length;
      });
      var html = '';
      Object.keys(config).forEach(function(key) {
        var isActive = key === StatusFilter.current;
        html += '<div class="status-filter-tag ' + (isActive ? 'active' : '') + '" data-filter="' + key + '">' + config[key].label + ' (' + counts[key] + ')</div>';
      });
      bar.innerHTML = html;
      bar.onclick = function(e) {
        var tag = e.target.closest('.status-filter-tag');
        if (!tag) return;
        StatusFilter.current = tag.dataset.filter;
        StatusFilter.render(containerId, config, data, options);
        if (typeof StatusFilter.onChange === 'function') StatusFilter.onChange(StatusFilter.current);
      };
    }
  };

  // ===== 3. 通用表格 =====
  var Table = {
    render: function(containerId, data, columns, options) {
      options = options || {};
      var tbody = document.getElementById(containerId);
      if (!tbody) return;
      tbody.innerHTML = '';
      var colSpan = columns.length + (options.hasCheckbox ? 1 : 0);
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + colSpan + '" style="text-align:center;padding:40px;color:var(--text-muted);">暂无数据</td></tr>';
        return;
      }
      data.forEach(function(row, idx) {
        var html = '<tr>';
        if (options.hasCheckbox) {
          html += '<td><input type="checkbox" data-id="' + (row.id || '') + '"></td>';
        }
        columns.forEach(function(col) {
          var val = '';
          if (typeof col.formatter === 'function') {
            val = col.formatter(row, idx);
          } else {
            val = row[col.field] || '';
            if (col.format) val = col.format(val, row);
          }
          var style = col.width ? ' style="width:' + col.width + '"' : '';
          var align = col.align ? ' style="text-align:' + col.align + '"' : style;
          html += '<td' + align + '>' + val + '</td>';
        });
        html += '</tr>';
        tbody.innerHTML += html;
      });
    }
  };

  // ===== 4. 分页（事件委托，无 onclick） =====
  var Pagination = {
    render: function(containerId, total, pageSize, currentPage, onChange) {
      var el = document.getElementById(containerId);
      if (!el) return;
      var totalPages = Math.ceil(total / pageSize);
      if (totalPages <= 1) { el.innerHTML = ''; return; }
      var html = '<div class="pagination">';
      html += '<button class="btn btn-secondary btn-sm" ' + (currentPage <= 1 ? 'disabled' : '') + ' data-page="' + (currentPage - 1) + '">上一页</button>';
      var maxButtons = 7;
      var start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
      var end = Math.min(totalPages, start + maxButtons - 1);
      if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);
      if (start > 1) html += '<button class="btn btn-secondary btn-sm" data-page="1">1</button>' + (start > 2 ? '<span>...</span>' : '');
      for (var i = start; i <= end; i++) {
        html += '<button class="btn btn-sm ' + (i === currentPage ? 'btn-primary' : 'btn-secondary') + '" data-page="' + i + '">' + i + '</button>';
      }
      if (end < totalPages) html += (end < totalPages - 1 ? '<span>...</span>' : '') + '<button class="btn btn-secondary btn-sm" data-page="' + totalPages + '">' + totalPages + '</button>';
      html += '<button class="btn btn-secondary btn-sm" ' + (currentPage >= totalPages ? 'disabled' : '') + ' data-page="' + (currentPage + 1) + '">下一页</button>';
      html += '</div>';
      el.innerHTML = html;
      el.onclick = function(e) {
        var btn = e.target.closest('button[data-page]');
        if (!btn || btn.disabled) return;
        var page = parseInt(btn.dataset.page, 10);
        if (typeof onChange === 'function') onChange(page);
      };
    }
  };

  // ===== 5. 弹窗 =====
  var Modal = {
    open: function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('active');
    },
    close: function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('active');
    }
  };

  // ===== 6. 数据守卫 =====
  function dataGuard(data, containerSelector, renderFn, options) {
    options = options || {};
    var container = document.querySelector(containerSelector);
    if (!container) return false;
    if (!data || !data.length) {
      container.innerHTML =
        '<div class="data-error-box">' +
        '<div class="data-error-icon">⚠️</div>' +
        '<div class="data-error-title">' + (options.title || '数据加载异常') + '</div>' +
        '<div class="data-error-desc">' + (options.desc || '暂无数据') + '</div>' +
        (options.showReload !== false ? '<button class="btn btn-primary" onclick="location.reload(true)">强制刷新</button>' : '') +
        '</div>';
      return false;
    }
    renderFn();
    return true;
  }

  // ===== 7. 防抖/节流 =====
  function debounce(fn, delay) {
    var timer;
    return function() {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  // ===== 8. URL 参数读取 =====
  function getUrlParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
    return match ? decodeURIComponent(match[1]) : null;
  }

  // ===== 9. 通知 Toast =====
  function toast(message, type) {
    type = type || 'info';
    var colors = { info: '#2563eb', success: '#059669', warning: '#d97706', error: '#dc2626' };
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#fff;border-left:4px solid ' + colors[type] + ';padding:14px 20px;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.15);font-size:14px;color:#1e293b;max-width:320px;transition:all 0.3s;transform:translateX(120%);opacity:0;';
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(function() {
      el.style.transform = 'translateX(0)';
      el.style.opacity = '1';
    });
    setTimeout(function() {
      el.style.transform = 'translateX(120%)';
      el.style.opacity = '0';
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 3000);
  }

  return {
    statusTag: statusTag,
    StatusFilter: StatusFilter,
    Table: Table,
    Pagination: Pagination,
    Modal: Modal,
    dataGuard: dataGuard,
    debounce: debounce,
    getUrlParam: getUrlParam,
    toast: toast
  };
})();
