// 声明一个订阅者
class Watcher {
  // 构造函数
  //  1) 需要使用订阅功能的节点
  //  2) 全局vm对象,用于获取数据
  //  3) 发布时需要做的事情
  constructor(vm, expr, cb) {
    this.vm = vm;
    // 缓存重要属性
    this.expr = expr;
    this.cb = cb;
    // 缓存当前值
    this.value = this.get();
  }

  // 获取当前值
  get() {
    // 把当前订阅者添加到全局
    Dep.target = this;
    // 获取当前值
    const value = this.vm.$data[this.expr];
    // 清空全局
    Dep.target = null;
    // 返回
    return value;
  }

  // 提供一个更新方法(为了应对发布后,要做的事情)
  update() {
    // 获取新值
    var newValue = this.vm.$data[this.expr];
    // 获取老值
    var oldValue = this.value;
    // 判断后
    if (newValue !== oldValue) {
      // 执行回调
      this.cb(newValue);

      // this.cb.call(this.vm, newValue);
    }
  }
}
