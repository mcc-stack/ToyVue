//  创建一个template模板编译工具
class TemplateCompiler {
  constructor(el, vm) {
    // 缓存重要的属性
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    // 判断视图存在
    if (this.el) {
      // 1.把模板内容放入内存(片段)
      var fragment = this.node2fragment(this.el);

      // 2.解析模板
      this.compile(fragment);

      // 3.把内存的结果返回页面中
      this.el.appendChild(fragment);
    }
  }

  // 工具方法 用于判断 是属性节点还是元素节点
  isElementNode(node) {
    return node.nodeType === 1; //1.元素节点 2.属性节点 3.文本节点
  }

  isTextNode(node) {
    return node.nodeType === 3;
  }

  toArray(fakeArr) {
    return [].slice.call(fakeArr);
  }

  isDirective(attrName) {
    return attrName.indexOf('v-') >= 0; // 判断属性名中是否有'v-'开头的属性
  }

  // 把模板放入内存,等待解析
  node2fragment(node) {
    console.log(node);
    // 1.创建内存片段
    var fragment = document.createDocumentFragment();
    var child;
    // 2.把模板内容丢到内存
    while ((child = node.firstChild)) {
      fragment.appendChild(child);
    }
    // 3.返回
    return fragment;
  }

  compile(parent) {
    // 1.获取子节点
    var childNodes = parent.childNodes;
    var compiler = this;
    // 2.遍历每一个节点
    this.toArray(childNodes).forEach(node => {
      // 3.判断节点类型
      if (compiler.isElementNode(node)) {
        // 1) 元素节点和属性节点 (解析指令)
        compiler.compileElement(node);
      } else {
        // 2) 文本节点 (解析指令)
        // 定义文本表达式验证规则
        var textReg = /\{\{(.+)\}\}/; // {{message}}
        var expr = node.textContent;
        // 按照规则验证内容
        if (textReg.test(expr)) {
          expr = RegExp.$1; // 返回第一个匹配到的字符串
          // 调用方法编译
          compiler.compileText(node, expr);
        }
      }
    });
    // 4) 如果还有子节点,继续解析 (递归)
  }
  // 解析元素节点的指令
  compileElement(node) {
    // 1.获取当前元素节点的所有属性
    var arrs = node.attributes;
    var compiler = this;
    // 2.遍历当前元素的所有属性
    this.toArray(arrs).forEach(attr => {
      var attrName = attr.name;
      // 3.判断属性是否是指令
      if (compiler.isDirective(attrName)) {
        // 4.收集
        // 指令类型(两种方法)
        // var type = attrName.split('-')[1];//v-text,v-model
        var type = attrName.substr(2); //v-text,v-model
        var expr = attr.value;
        CompilerUtils[type](node, compiler.vm, expr);
      }
    });
  }

  compileText(node, expr) {
    CompilerUtils.text(node, this.vm, expr);
  }
}

// 方法对象
CompilerUtils = {
  // 解析text指令
  text(node, vm, expr) {
    // 1.找到更新方法
    var updaterFn = this.updater['textUpdater'];
    // 2.执行方法
    updaterFn && updaterFn(node, vm.$data[expr]); // 等价于if(updaterFn)才执行后面的方法
    new Watcher(vm, expr, newValue => {
      // 触发订阅时,按照之前的规则,对节点进行更新
      updaterFn && updaterFn(node, newValue);
    });
  },
  // 解析model指令
  model(node, vm, expr) {
    // 1.找到更新方法
    const updaterFn = this.updater['modelUpdater'];
    // 2.执行方法
    updaterFn && updaterFn(node, vm.$data[expr]); // 等价于if(updaterFn)才执行后面的方法
    // 3.视图到模型
    node.addEventListener('change', e => {
      // 获取输入框的新值
      var newValue = e.target.value;
      // console.log("newValue:", newValue);
      // 把值放入数据
      vm.$data[expr] = newValue;
    });
    // model指令也需要一个订阅者
    new Watcher(vm, expr, newValue => {
      // 触发订阅时,按照之前的规则,对节点进行更新
      updaterFn && updaterFn(node, newValue);
    });
  },
  // 更新规则对象
  updater: {
    // 文本更新方法
    textUpdater(node, value) {
      node.textContent = value;
    },
    // 输入框更新方法
    modelUpdater(node, value) {
      node.value = value; // input.value
    }
  }
};
